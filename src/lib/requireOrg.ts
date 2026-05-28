import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface OrgProfile {
  org_id: string
  role: string
  email: string
}

export async function requireOrg(
  supabase: SupabaseClient,
  userId: string
): Promise<OrgProfile> {
  const { data: profile } = await supabase
    .from('users')
    .select('org_id, role, email')
    .eq('id', userId)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  return profile as OrgProfile
}
