import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/didit/client'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { full_name, email, phone, role_applied, client_id, aml_enabled } = body

  if (!full_name || !email) {
    return NextResponse.json({ error: 'full_name and email are required' }, { status: 400 })
  }

  const service = createServiceClient()

  // Get recruiter's org
  const { data: profile } = await service.from('users').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return NextResponse.json({ error: 'No organization — complete onboarding first' }, { status: 403 })

  // Insert candidate
  const { data: candidate, error: candidateErr } = await service
    .from('candidates')
    .insert({
      full_name,
      email,
      phone: phone || null,
      role_applied: role_applied || null,
      client_id: client_id || null,
      recruiter_id: user.id,
      org_id: profile.org_id,
      aml_enabled: Boolean(aml_enabled),
      overall_status: 'pending',
    })
    .select('*, clients(name)')
    .single()

  if (candidateErr) {
    return NextResponse.json({ error: candidateErr.message }, { status: 500 })
  }

  const workflowId = process.env.DIDIT_WORKFLOW_C1!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  let sessionData: { session_id: string; url: string }
  try {
    sessionData = await createSession({
      workflow_id: workflowId,
      vendor_data: candidate.id,
      callback: `${appUrl}/api/webhooks/didit`,
    })
  } catch (err) {
    await service.from('candidates').delete().eq('id', candidate.id)
    const msg = err instanceof Error ? err.message : 'Didit session creation failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  await service
    .from('candidates')
    .update({ didit_session_id: sessionData.session_id, overall_status: 'not_started' })
    .eq('id', candidate.id)

  await service.from('verifications').insert({
    candidate_id: candidate.id,
    checkpoint: 'C1',
    didit_session_id: sessionData.session_id,
    workflow_id: workflowId,
    session_url: sessionData.url,
    status: 'not_started',
  })

  await logAudit('candidate_created', {
    actorId: user.id,
    candidateId: candidate.id,
    meta: { email, aml_enabled: Boolean(aml_enabled) },
  })

  return NextResponse.json({
    candidate: { ...candidate, overall_status: 'not_started', didit_session_id: sessionData.session_id },
    session_url: sessionData.url,
  })
}
