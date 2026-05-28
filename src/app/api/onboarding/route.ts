import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json() as { name?: string }
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const service = createServiceClient()

  // Check user doesn't already have an org
  const { data: profile } = await service.from('users').select('org_id').eq('id', user.id).single()
  if (profile?.org_id) return NextResponse.json({ error: 'Already in an organization' }, { status: 409 })

  // Generate a unique slug
  let slug = slugify(name)
  const { count } = await service.from('organizations').select('id', { count: 'exact', head: true }).eq('slug', slug)
  if ((count ?? 0) > 0) slug = `${slug}-${Date.now().toString(36)}`

  // Create org
  const { data: org, error: orgErr } = await service
    .from('organizations')
    .insert({ name: name.trim(), slug })
    .select('id')
    .single()

  if (orgErr || !org) {
    return NextResponse.json({ error: orgErr?.message ?? 'Failed to create organization' }, { status: 500 })
  }

  // Promote user to admin of this org
  const { error: userErr } = await service.from('users').update({ org_id: org.id, role: 'admin' }).eq('id', user.id)
  if (userErr) return NextResponse.json({ error: 'Failed to set organization' }, { status: 500 })

  return NextResponse.json({ ok: true, org_id: org.id })
}
