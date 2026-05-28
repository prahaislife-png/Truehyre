import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import type { CandidateStatus, DiditDecision } from '@/lib/types'

export const runtime = 'nodejs'

// Recursively sort object keys and convert whole-number floats to ints
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

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature-v2') ?? ''
  const timestampHeader = request.headers.get('x-timestamp') ?? ''
  const timestamp = parseInt(timestampHeader, 10)

  // Replay protection: reject if older than 5 minutes
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (isNaN(timestamp) || Math.abs(nowSeconds - timestamp) > 300) {
    return NextResponse.json({ error: 'Timestamp out of range' }, { status: 401 })
  }

  // Verify signature
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

  // Idempotency: dedupe on (session_id, webhook_type, timestamp)
  const { error: dupError } = await service.from('webhook_events').insert({
    session_id: sessionId,
    webhook_type: webhookType,
    timestamp,
    payload: parsed,
  })

  // Unique constraint violation means already processed
  if (dupError && dupError.code === '23505') {
    return NextResponse.json({ ok: true })
  }
  if (dupError) {
    console.error('webhook_events insert error:', dupError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // Process status.updated and data.updated
  if (webhookType === 'status.updated' || webhookType === 'data.updated') {
    const diditStatus = (parsed.status as string) ?? ''
    const internalStatus = diditStatusToInternal(diditStatus)
    const decision = (parsed.decision as DiditDecision) ?? null

    // Extract scores from decision arrays
    const livenessScore = decision?.liveness_checks?.[0]?.score ?? null
    const faceMatchScore = decision?.face_matches?.[0]?.score != null
      ? decision.face_matches[0].score / 100
      : null
    const amlHits = decision?.aml_screenings?.[0]?.total_hits ?? null

    // Update verifications
    await service
      .from('verifications')
      .update({
        status: internalStatus,
        decision_json: decision,
        liveness_score: livenessScore,
        face_match_score: faceMatchScore,
        aml_hits: amlHits,
        completed_at: ['approved', 'declined'].includes(internalStatus) ? new Date().toISOString() : null,
      })
      .eq('didit_session_id', sessionId)

    // Update candidate overall_status
    await service
      .from('candidates')
      .update({ overall_status: internalStatus })
      .eq('didit_session_id', sessionId)
  }

  return NextResponse.json({ ok: true })
}
