import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/didit/client'
import { logAudit } from '@/lib/audit'
import { sendVerificationLink } from '@/lib/email/sendVerificationLink'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { checkpoint } = await request.json() as { checkpoint: 'C2' | 'C3' }
  if (checkpoint !== 'C2' && checkpoint !== 'C3') {
    return NextResponse.json({ error: 'checkpoint must be C2 or C3' }, { status: 400 })
  }

  // Verify candidate is accessible to recruiter
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, email, didit_session_id, overall_status')
    .eq('id', id)
    .single()

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Must have completed C1 first
  const service = createServiceClient()
  const { data: c1 } = await service
    .from('verifications')
    .select('id, status, reference_image_url')
    .eq('candidate_id', id)
    .eq('checkpoint', 'C1')
    .single()

  if (!c1 || c1.status !== 'approved') {
    return NextResponse.json(
      { error: 'C1 must be approved before running ' + checkpoint },
      { status: 422 }
    )
  }

  // Check no active C2/C3 session already pending
  const { data: existing } = await service
    .from('verifications')
    .select('id, status')
    .eq('candidate_id', id)
    .eq('checkpoint', checkpoint)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing && ['not_started', 'in_progress', 'awaiting_user'].includes(existing.status)) {
    return NextResponse.json(
      { error: `A ${checkpoint} session is already in progress` },
      { status: 409 }
    )
  }

  const workflowId = process.env.DIDIT_WORKFLOW_RECHECK!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  let sessionData: { session_id: string; url: string }
  try {
    sessionData = await createSession({
      workflow_id: workflowId,
      vendor_data: `${id}:${checkpoint}`,
      callback: `${appUrl}/verify/complete`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Didit session creation failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  await service.from('verifications').insert({
    candidate_id: id,
    checkpoint,
    didit_session_id: sessionData.session_id,
    workflow_id: workflowId,
    session_url: sessionData.url,
    status: 'not_started',
  })

  await logAudit(`${checkpoint}_initiated`, {
    actorId: user.id,
    candidateId: id,
    meta: { session_id: sessionData.session_id },
  })

  // Email the candidate their verification link
  const { data: profile } = await service.from('users').select('org_id').eq('id', user.id).single()
  const { data: org } = profile?.org_id
    ? await service.from('organizations').select('name').eq('id', profile.org_id).single()
    : { data: null }

  const CHECKPOINT_LABEL: Record<string, string> = {
    C2: 'Interview check',
    C3: 'Offer check',
  }
  await sendVerificationLink({
    to: candidate.email,
    candidateName: candidate.full_name,
    verificationUrl: sessionData.url,
    orgName: org?.name ?? 'TrueHire',
    subject: `Action required: ${CHECKPOINT_LABEL[checkpoint] ?? checkpoint} verification`,
  })

  return NextResponse.json({ session_url: sessionData.url })
}
