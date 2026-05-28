import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendVerificationLink } from '@/lib/email/sendVerificationLink'

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
    .select('id, full_name, email')
    .eq('id', id)
    .single()

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: verification } = await service
    .from('verifications')
    .select('session_url')
    .eq('candidate_id', id)
    .not('session_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!verification?.session_url) {
    return NextResponse.json({ error: 'No verification session found' }, { status: 404 })
  }

  const { data: profile } = await service
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const { data: org } = profile?.org_id
    ? await service.from('organizations').select('name').eq('id', profile.org_id).single()
    : { data: null }

  await sendVerificationLink({
    to: candidate.email,
    candidateName: candidate.full_name,
    verificationUrl: verification.session_url,
    orgName: org?.name ?? 'TrueHire',
  })

  return NextResponse.json({ ok: true })
}
