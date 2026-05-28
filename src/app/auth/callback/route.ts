import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteToken = searchParams.get('invite')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If there's a pending invite, go accept it first
      if (inviteToken) {
        return NextResponse.redirect(`${origin}/invite/${inviteToken}`)
      }

      // Check if this user has an org yet
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const service = createServiceClient()
        const { data: profile } = await service.from('users').select('org_id').eq('id', user.id).single()
        if (!profile?.org_id) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
