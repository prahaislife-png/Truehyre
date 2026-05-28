import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/didit/client'
import { logAudit } from '@/lib/audit'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, overall_status')
    .eq('id', id)
    .single()

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Find the C1 verification that needs a fresh session
  const { data: verification } = await service
    .from('verifications')
    .select('id, status, checkpoint')
    .eq('candidate_id', id)
    .eq('checkpoint', 'C1')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!verification) {
    return NextResponse.json({ error: 'No C1 verification found' }, { status: 404 })
  }

  if (['approved', 'declined'].includes(verification.status)) {
    return NextResponse.json({ error: 'C1 is already in a terminal state' }, { status: 409 })
  }

  const workflowId = process.env.DIDIT_WORKFLOW_C1!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  let sessionData: { session_id: string; url: string }
  try {
    sessionData = await createSession({
      workflow_id: workflowId,
      vendor_data: id,
      callback: `${appUrl}/api/webhooks/didit`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Didit session creation failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  await service
    .from('verifications')
    .update({
      didit_session_id: sessionData.session_id,
      session_url: sessionData.url,
      status: 'not_started',
    })
    .eq('id', verification.id)

  await service
    .from('candidates')
    .update({ didit_session_id: sessionData.session_id, overall_status: 'not_started' })
    .eq('id', id)

  await logAudit('c1_session_refreshed', {
    actorId: user.id,
    candidateId: id,
    meta: { session_id: sessionData.session_id },
  })

  return NextResponse.json({ session_url: sessionData.url })
}
