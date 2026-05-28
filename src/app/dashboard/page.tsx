import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireOrg } from '@/lib/requireOrg'
import CandidateTable from '@/components/CandidateTable'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import KpiCards from '@/components/dashboard/KpiCards'
import VerificationPipeline from '@/components/dashboard/VerificationPipeline'
import RecentActivity from '@/components/dashboard/RecentActivity'
import Link from 'next/link'

const ACTION_STATUSES = new Set(['pending', 'not_started', 'awaiting_user', 'in_progress', 'in_review', 'resubmitted'])
const IN_PROGRESS_STATUSES = new Set(['pending', 'not_started', 'awaiting_user', 'in_progress', 'in_review', 'resubmitted'])

function cpStats(verifications: { checkpoint: string | null; status: string }[], cp: string) {
  const rows = verifications.filter(v => v.checkpoint === cp || (cp === 'C1' && v.checkpoint === null))
  return {
    total: rows.length,
    approved: rows.filter(v => v.status === 'approved').length,
    declined: rows.filter(v => v.status === 'declined').length,
    inProgress: rows.filter(v => IN_PROGRESS_STATUSES.has(v.status)).length,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await requireOrg(supabase, user.id)

  const [
    { data: candidates },
    { data: clients },
    { data: org },
    { data: verifications },
    { data: recentAudit },
  ] = await Promise.all([
    supabase.from('candidates').select('*, clients(name)').order('created_at', { ascending: false }),
    supabase.from('clients').select('*').order('name'),
    supabase.from('organizations').select('name').eq('id', profile.org_id).single(),
    supabase.from('verifications').select('checkpoint, status'),
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const all = candidates ?? []
  const allVerifications = verifications ?? []
  const auditEntries = recentAudit ?? []

  const kpis = {
    total: all.length,
    passed: all.filter(c => c.overall_status === 'approved').length,
    failed: all.filter(c => c.overall_status === 'declined').length,
    action: all.filter(c => ACTION_STATUSES.has(c.overall_status)).length,
  }

  const pipeline = {
    c1: cpStats(allVerifications, 'C1'),
    c2: cpStats(allVerifications, 'C2'),
    c3: cpStats(allVerifications, 'C3'),
  }

  // Map candidate IDs → names for activity feed
  const candidateNames: Record<string, string> = {}
  all.forEach(c => { candidateNames[c.id] = c.full_name })

  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()
  const orgName = org?.name ?? ''

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-base tracking-tight">
                True<span className="text-blue-500">Hire</span>
              </span>
            </Link>
            {orgName && (
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1 font-medium hidden sm:inline">
                {orgName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
            {profile.role === 'admin' && (
              <Link
                href="/settings/team"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Team</span>
              </Link>
            )}
            <form action={handleSignOut}>
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-200">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 select-none">
                  {initials}
                </div>
                <span className="text-sm text-gray-500 hidden md:block max-w-[160px] truncate">{user.email}</span>
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

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome banner */}
        <WelcomeBanner
          orgName={orgName}
          userEmail={user.email ?? ''}
          initials={initials}
          totalCandidates={kpis.total}
          isAdmin={profile.role === 'admin'}
        />

        {/* KPI cards */}
        <KpiCards {...kpis} />

        {/* Pipeline + Activity — 2-column on large screens */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VerificationPipeline
              c1={pipeline.c1}
              c2={pipeline.c2}
              c3={pipeline.c3}
              totalCandidates={kpis.total}
            />
          </div>
          <div>
            <RecentActivity entries={auditEntries} candidateNames={candidateNames} />
          </div>
        </div>

        {/* Candidate table */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">All Candidates</h2>
            <p className="text-sm text-gray-400 mt-0.5">{kpis.total} total · sorted by most recent</p>
          </div>
          <CandidateTable
            candidates={all}
            clients={clients ?? []}
            recruiterId={user.id}
          />
        </div>
      </main>
    </div>
  )
}
