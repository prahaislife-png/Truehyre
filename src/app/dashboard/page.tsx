import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireOrg } from '@/lib/requireOrg'
import CandidateTable from '@/components/CandidateTable'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await requireOrg(supabase, user.id)

  const [{ data: candidates }, { data: clients }, { data: org }] = await Promise.all([
    supabase.from('candidates').select('*, clients(name)').order('created_at', { ascending: false }),
    supabase.from('clients').select('*').order('name'),
    supabase.from('organizations').select('name').eq('id', profile.org_id).single(),
  ])

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">TrueHire</h1>
            {org?.name && (
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">
                {org.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {profile.role === 'admin' && (
              <Link href="/settings/team" className="text-sm text-gray-500 hover:text-gray-800">
                Team
              </Link>
            )}
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action={handleSignOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Candidates</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {candidates?.length ?? 0} total
          </p>
        </div>
        <CandidateTable
          candidates={candidates ?? []}
          clients={clients ?? []}
          recruiterId={user.id}
        />
      </main>
    </div>
  )
}
