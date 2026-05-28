import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { full_name, email, phone, role_applied, client_id } = body

  if (!full_name || !email) {
    return NextResponse.json({ error: 'full_name and email are required' }, { status: 400 })
  }

  const service = createServiceClient()

  // Confirm caller owns this candidate (via org)
  const { data: profile } = await service.from('users').select('org_id').eq('id', user.id).single()
  const { data: candidate } = await service.from('candidates').select('org_id, recruiter_id').eq('id', id).single()
  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (candidate.org_id !== profile?.org_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: updated, error } = await service
    .from('candidates')
    .update({
      full_name,
      email,
      phone: phone || null,
      role_applied: role_applied || null,
      client_id: client_id || null,
    })
    .eq('id', id)
    .select('*, clients(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit('candidate_updated', {
    actorId: user.id,
    candidateId: id,
    meta: { full_name, email },
  })

  return NextResponse.json({ candidate: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: profile } = await service.from('users').select('org_id, role').eq('id', user.id).single()
  const { data: candidate } = await service.from('candidates').select('org_id, recruiter_id').eq('id', id).single()
  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (candidate.org_id !== profile?.org_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // Only admin or the recruiter who added can delete
  if (profile?.role !== 'admin' && candidate.recruiter_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await service.from('candidates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit('candidate_deleted', { actorId: user.id, candidateId: id, meta: {} })

  return NextResponse.json({ ok: true })
}
