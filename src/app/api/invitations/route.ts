import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendInvite } from '@/lib/email/sendInvite'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: profile } = await service.from('users').select('org_id, role').eq('id', user.id).single()
  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 403 })
  if (profile.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { email, role } = await request.json() as { email?: string; role?: string }
  if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const validRoles = ['admin', 'recruiter', 'client_viewer']
  const inviteRole = validRoles.includes(role ?? '') ? role! : 'recruiter'

  // Check not already a member
  const { data: existing } = await service
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('org_id', profile.org_id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'This person is already a member' }, { status: 409 })

  // Create invitation
  const { data: invitation, error: inviteErr } = await service
    .from('invitations')
    .insert({ org_id: profile.org_id, email: email.toLowerCase().trim(), role: inviteRole, invited_by: user.id })
    .select('token')
    .single()

  if (inviteErr || !invitation) {
    return NextResponse.json({ error: inviteErr?.message ?? 'Failed to create invitation' }, { status: 500 })
  }

  // Get org name
  const { data: org } = await service.from('organizations').select('name').eq('id', profile.org_id).single()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const inviteUrl = `${appUrl}/invite/${invitation.token}`

  await sendInvite({
    to: email.trim(),
    orgName: org?.name ?? 'TrueHire',
    invitedByEmail: user.email!,
    inviteUrl,
    role: inviteRole,
  })

  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: profile } = await service.from('users').select('org_id, role').eq('id', user.id).single()
  if (!profile?.org_id || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { data: invitations } = await service
    .from('invitations')
    .select('id, email, role, accepted_at, expires_at, created_at')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ invitations: invitations ?? [] })
}
