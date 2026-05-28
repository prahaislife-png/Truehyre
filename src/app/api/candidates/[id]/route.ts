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
  const { full_name, email, phone, role_applied, client_id, proof_of_address_enabled, database_validation_enabled } = body

  const isProfileUpdate = full_name !== undefined || email !== undefined
  if (isProfileUpdate && (!full_name || !email)) {
    return NextResponse.json({ error: 'full_name and email are required' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: profile } = await service.from('users').select('org_id').eq('id', user.id).single()
  const { data: candidate } = await service.from('candidates').select('org_id, recruiter_id').eq('id', id).single()
  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (candidate.org_id !== profile?.org_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updateData: Record<string, unknown> = {}
  if (isProfileUpdate) {
    updateData.full_name = full_name
    updateData.email = email
    updateData.phone = phone || null
    updateData.role_applied = role_applied || null
    updateData.client_id = client_id || null
  }
  if (proof_of_address_enabled !== undefined) updateData.proof_of_address_enabled = Boolean(proof_of_address_enabled)
  if (database_validation_enabled !== undefined) updateData.database_validation_enabled = Boolean(database_validation_enabled)

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data: updated, error } = await service
    .from('candidates')
    .update(updateData)
    .eq('id', id)
    .select('*, clients(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit('candidate_updated', {
    actorId: user.id,
    candidateId: id,
    meta: isProfileUpdate ? { full_name, email } : { proof_of_address_enabled, database_validation_enabled },
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
