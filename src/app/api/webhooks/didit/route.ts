import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import {
  extractSelfieUrl,
  faceMatch,
  faceSearch,
  fetchImageBuffer,
  getDecision,
} from '@/lib/didit/client'
import { sendVerificationResult } from '@/lib/email/sendVerificationResult'
import type { CandidateStatus, DiditDecision } from '@/lib/types'

export const runtime = 'nodejs'

// Didit redirects the candidate's browser here after verification completes.
// Redirect them to the proper thank-you page instead of returning 405.
export function GET() {
  return NextResponse.redirect(
    new URL('/verify/complete', process.env.NEXT_PUBLIC_APP_URL!),
    { status: 302 }
  )
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(value as object).sort()) {
      sorted[key] = canonicalize((value as Record<string, unknown>)[key])
    }
    return sorted
  }
  if (typeof value === 'number' && Number.isFinite(value) && value === Math.floor(value)) {
    return Math.floor(value)
  }
  return value
}

function diditStatusToInternal(status: string): CandidateStatus {
  const map: Record<string, CandidateStatus> = {
    'Approved': 'approved',
    'Declined': 'declined',
    'In Review': 'in_review',
    'In Progress': 'in_progress',
    'Not Started': 'not_started',
    'Awaiting User': 'awaiting_user',
    'Resubmitted': 'resubmitted',
    'Abandoned': 'abandoned',
    'Expired': 'expired',
    'Kyc Expired': 'kyc_expired',
  }
  return map[status] ?? 'pending'
}

// Run after C1 is approved: enroll face in search pool + store reference image URL
async function processC1Completion(
  service: ReturnType<typeof createServiceClient>,
  candidateId: string,
  verificationId: string,
  decision: DiditDecision
) {
  const selfieUrl = extractSelfieUrl(decision as unknown as Record<string, unknown>)
  if (!selfieUrl) return

  try {
    const imageBuffer = await fetchImageBuffer(selfieUrl)
    // Enroll in face-search pool so future C2/C3 searches detect duplicates
    await faceSearch(imageBuffer, candidateId)
    // Store reference image URL for C2/C3 face-match calls
    await service
      .from('verifications')
      .update({ reference_image_url: selfieUrl })
      .eq('id', verificationId)
  } catch (err) {
    console.error('C1 face enrollment error:', err)
  }
}

// Run after C2/C3 liveness is approved: 1:1 face-match + 1:N duplicate search
async function processRecheckCompletion(
  service: ReturnType<typeof createServiceClient>,
  candidateId: string,
  verificationId: string,
  checkpoint: 'C2' | 'C3',
  sessionId: string,
  decision: DiditDecision
) {
  // Get C1 reference image URL
  const { data: c1 } = await service
    .from('verifications')
    .select('reference_image_url')
    .eq('candidate_id', candidateId)
    .eq('checkpoint', 'C1')
    .single()

  if (!c1?.reference_image_url) {
    console.error(`${checkpoint}: No C1 reference image for candidate ${candidateId}`)
    return
  }

  // Get the new selfie from this session's decision
  const newSelfieUrl = extractSelfieUrl(decision as unknown as Record<string, unknown>)
  if (!newSelfieUrl) {
    // Try fetching fresh decision from Didit in case webhook payload is incomplete
    try {
      const fresh = await getDecision(sessionId)
      const freshUrl = extractSelfieUrl(fresh)
      if (!freshUrl) {
        console.error(`${checkpoint}: Cannot extract selfie from decision for session ${sessionId}`)
        return
      }
      return processRecheckWithImages(service, candidateId, verificationId, checkpoint, c1.reference_image_url, freshUrl)
    } catch {
      console.error(`${checkpoint}: Failed to fetch fresh decision`)
      return
    }
  }

  await processRecheckWithImages(service, candidateId, verificationId, checkpoint, c1.reference_image_url, newSelfieUrl)
}

async function processRecheckWithImages(
  service: ReturnType<typeof createServiceClient>,
  candidateId: string,
  verificationId: string,
  checkpoint: 'C2' | 'C3',
  refImageUrl: string,
  newImageUrl: string
) {
  try {
    const [refBuffer, newBuffer] = await Promise.all([
      fetchImageBuffer(refImageUrl),
      fetchImageBuffer(newImageUrl),
    ])

    // 1:1 face match — new capture vs C1 reference
    const matchResult = await faceMatch(newBuffer, refBuffer, candidateId)
    const matchScore = matchResult.face_match.score
    const matchStatus = matchResult.face_match.status // 'Approved' | 'Declined'

    // 1:N face search — detect if this face appears under a different candidate identity.
    // save_api_request=false: don't enroll the C2/C3 selfie; only the C1 baseline lives in the pool.
    const searchResult = await faceSearch(newBuffer, candidateId, false)
    const otherMatches = searchResult.face_search.matches.filter(
      m => m.vendor_data && m.vendor_data !== candidateId && m.similarity_percentage >= 70
    )
    const isDuplicate = otherMatches.length > 0
    const duplicateCandidateId = isDuplicate ? otherMatches[0].vendor_data : null

    // Map to overall result
    let recheckStatus: CandidateStatus
    if (isDuplicate) {
      recheckStatus = 'declined' // duplicate face = automatic fail
    } else if (matchStatus === 'Approved') {
      recheckStatus = 'approved'
    } else {
      recheckStatus = 'declined'
    }

    await service.from('verifications').update({
      face_match_score: matchScore / 100, // normalise to 0-1
      duplicate_face_flag: isDuplicate,
      duplicate_candidate_id: duplicateCandidateId || null,
      status: recheckStatus,
      completed_at: new Date().toISOString(),
    }).eq('id', verificationId)

    // Update candidate overall_status only when C2/C3 is the latest completed checkpoint
    await service.from('candidates').update({ overall_status: recheckStatus }).eq('id', candidateId)

    if (isDuplicate) {
      console.warn(`DUPLICATE FACE detected: candidate ${candidateId} matches ${duplicateCandidateId} at ${checkpoint}`)
    }
  } catch (err) {
    console.error(`${checkpoint} face-match error:`, err)
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature-v2') ?? ''
  const timestampHeader = request.headers.get('x-timestamp') ?? ''
  const timestamp = parseInt(timestampHeader, 10)

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (isNaN(timestamp) || Math.abs(nowSeconds - timestamp) > 300) {
    return NextResponse.json({ error: 'Timestamp out of range' }, { status: 401 })
  }

  const secret = process.env.DIDIT_WEBHOOK_SECRET!
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const canonical = JSON.stringify(canonicalize(parsed))
  const expected = createHmac('sha256', secret).update(canonical, 'utf8').digest('hex')

  let signatureMatch = false
  try {
    signatureMatch = timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    signatureMatch = false
  }
  if (!signatureMatch) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const webhookType = (parsed.webhook_type as string) ?? ''
  const sessionId = (parsed.session_id as string) ?? ''
  const service = createServiceClient()

  // Idempotency
  const { error: dupError } = await service.from('webhook_events').insert({
    session_id: sessionId,
    webhook_type: webhookType,
    timestamp,
    payload: parsed,
  })
  if (dupError?.code === '23505') return NextResponse.json({ ok: true })
  if (dupError) return NextResponse.json({ error: 'DB error' }, { status: 500 })

  if (webhookType === 'status.updated' || webhookType === 'data.updated') {
    const diditStatus = (parsed.status as string) ?? ''
    const internalStatus = diditStatusToInternal(diditStatus)
    const decision = (parsed.decision as DiditDecision) ?? null

    const livenessScore = decision?.liveness_checks?.[0]?.score ?? null
    const faceMatchScore = decision?.face_matches?.[0]?.score != null
      ? decision.face_matches[0].score / 100
      : null
    const amlHits = decision?.aml_screenings?.[0]?.total_hits ?? null
    const isTerminal = ['approved', 'declined'].includes(internalStatus)

    // Look up which verification this session belongs to (could be C1, C2, or C3)
    const { data: verification } = await service
      .from('verifications')
      .select('id, candidate_id, checkpoint')
      .eq('didit_session_id', sessionId)
      .single()

    if (verification) {
      await service.from('verifications').update({
        status: internalStatus,
        decision_json: decision,
        liveness_score: livenessScore,
        face_match_score: faceMatchScore,
        aml_hits: amlHits,
        completed_at: isTerminal ? new Date().toISOString() : null,
      }).eq('id', verification.id)

      await service.from('candidates')
        .update({ overall_status: internalStatus })
        .eq('id', verification.candidate_id)

      // Email recruiter on terminal status
      if (isTerminal) {
        const { data: candidate } = await service
          .from('candidates')
          .select('full_name, recruiter_id')
          .eq('id', verification.candidate_id)
          .single()
        if (candidate) {
          const { data: recruiter } = await service
            .from('users')
            .select('email')
            .eq('id', candidate.recruiter_id)
            .single()
          if (recruiter?.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL!
            await sendVerificationResult({
              to: recruiter.email,
              candidateName: candidate.full_name,
              status: internalStatus,
              checkpoint: verification.checkpoint,
              profileUrl: `${appUrl}/candidates/${verification.candidate_id}`,
            })
          }
        }
      }

      // Post-processing on approval
      if (internalStatus === 'approved' && decision) {
        // null checkpoint is a legacy C1 row (checkpoint column was added after initial deploy)
        const isC1 = verification.checkpoint === 'C1' || verification.checkpoint === null
        if (isC1) {
          // Backfill checkpoint so future lookups work correctly
          if (verification.checkpoint === null) {
            await service.from('verifications').update({ checkpoint: 'C1' }).eq('id', verification.id)
          }
          await processC1Completion(service, verification.candidate_id, verification.id, decision)
        } else if (verification.checkpoint === 'C2' || verification.checkpoint === 'C3') {
          await processRecheckCompletion(
            service,
            verification.candidate_id,
            verification.id,
            verification.checkpoint,
            sessionId,
            decision
          )
        }
      }
    } else {
      // Fallback: match by candidate didit_session_id (C1 legacy path)
      await service.from('verifications').update({
        status: internalStatus,
        decision_json: decision,
        liveness_score: livenessScore,
        face_match_score: faceMatchScore,
        aml_hits: amlHits,
        completed_at: isTerminal ? new Date().toISOString() : null,
      }).eq('didit_session_id', sessionId)

      await service.from('candidates')
        .update({ overall_status: internalStatus })
        .eq('didit_session_id', sessionId)
    }
  }

  return NextResponse.json({ ok: true })
}
