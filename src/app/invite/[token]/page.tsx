import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: invitation } = await service
    .from('invitations')
    .select('*, organizations(name)')
    .eq('token', token)
    .maybeSingle()

  if (!invitation || invitation.accepted_at || new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invitation not valid</h1>
          <p className="text-sm text-gray-500">This invitation has expired or already been used.</p>
          <Link href="/auth/login" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
            Sign in to TrueHire →
          </Link>
        </div>
      </div>
    )
  }

  const orgName = (invitation.organizations as { name: string } | null)?.name ?? 'TrueHire'

  // Check if user is already logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Auto-accept server-side
    await service.from('users').update({ org_id: invitation.org_id, role: invitation.role }).eq('id', user.id)
    await service.from('invitations').update({ accepted_at: new Date().toISOString() }).eq('id', invitation.id)
    redirect('/dashboard')
  }

  const roleLabel = invitation.role === 'admin' ? 'Admin' : invitation.role === 'client_viewer' ? 'Client Viewer' : 'Recruiter'
  const signupUrl = `/auth/signup?invite=${token}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-5">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">You&apos;re invited to {orgName}</h1>
        <p className="text-sm text-gray-500 mb-1">Join as <span className="font-medium text-gray-700">{roleLabel}</span></p>
        <p className="text-xs text-gray-400 mb-8">Sign up to accept this invitation.</p>

        <Link
          href={signupUrl}
          className="w-full inline-block bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Accept invitation →
        </Link>

        <p className="mt-4 text-xs text-gray-400">
          Already have an account?{' '}
          <Link href={`/auth/login?invite=${token}`} className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
