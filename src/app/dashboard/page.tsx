import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireOrg } from '@/lib/requireOrg'
import CandidateTable from '@/components/CandidateTable'
import Link from 'next/link'

const KPI_STATUSES = {
  action: new Set(['pending', 'not_started', 'awaiting_user', 'in_progress', 'in_review', 'resubmitted']),
  passed: new Set(['approved']),
  failed: new Set(['declined']),
}

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

  const all = candidates ?? []
  const kpis = {
    total: all.length,
    passed: all.filter(c => KPI_STATUSES.passed.has(c.overall_status)).length,
    failed: all.filter(c => KPI_STATUSES.failed.has(c.overall_status)).length,
    action: all.filter(c => KPI_STATUSES.action.has(c.overall_status)).length,
  }

  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">
              True<span className="text-blue-500">Hire</span>
            </span>
            {org?.name && (
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1 font-medium">
                {org.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {profile.role === 'admin' && (
              <Link
                href="/settings/team"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Team
              </Link>
            )}
            <form action={handleSignOut}>
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-200">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
                <span className="text-sm text-gray-500 hidden sm:block max-w-[180px] truncate">{user.email}</span>
                <button
                  type="submit"
                  className="ml-1 text-sm text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{kpis.total} total across all checkpoints</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Total verified</p>
            <p className="text-3xl font-black text-gray-900">{kpis.total}</p>
            <p className="text-xs text-gray-400 mt-1">all time</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Passed</p>
            <p className="text-3xl font-black text-emerald-600">{kpis.passed}</p>
            <p className="text-xs text-gray-400 mt-1">
              {kpis.total > 0 ? Math.round((kpis.passed / kpis.total) * 100) : 0}% pass rate
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Failed</p>
            <p className="text-3xl font-black text-red-500">{kpis.failed}</p>
            <p className="text-xs text-gray-400 mt-1">
              {kpis.total > 0 ? Math.round((kpis.failed / kpis.total) * 100) : 0}% fail rate
            </p>
          </div>
          <div className={`rounded-xl border p-5 ${kpis.action > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${kpis.action > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
              Need action
            </p>
            <p className={`text-3xl font-black ${kpis.action > 0 ? 'text-blue-600' : 'text-gray-900'}`}>{kpis.action}</p>
            <p className="text-xs text-gray-400 mt-1">awaiting verification</p>
          </div>
        </div>

        <CandidateTable
          candidates={all}
          clients={clients ?? []}
          recruiterId={user.id}
        />
      </main>
    </div>
  )
}
