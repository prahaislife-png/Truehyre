import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireOrg } from '@/lib/requireOrg'
import StatusBadge from '@/components/StatusBadge'
import CheckpointTimeline from '@/components/CheckpointTimeline'
import CheckpointActions from '@/components/CheckpointActions'
import SendLinkBox from '@/components/SendLinkBox'
import CandidateRefresher from '@/components/CandidateRefresher'
import CandidateDetailActions from '@/components/CandidateDetailActions'
import type { CandidateStatus, Verification, DiditWarning } from '@/lib/types'
import Link from 'next/link'

const WARNING_MAP: Record<string, string> = {
  'Screen capture of document detected': 'Document photographed from a screen — ask candidate to use the original',
  'Date of birth not detected': 'Date of birth not visible on document',
  'First name and/or last name not detected': 'Name not detected on document',
  'OCR data in the document is not consistent': 'Document text is unclear or inconsistent',
  'Document number not detected': 'Document number not visible',
  'Portrait image not detected': 'Face photo not found on document',
  'Could not detect document type': 'Document type not recognized — check candidate is using a valid ID',
}

function humanizeWarning(w: string | DiditWarning): string {
  const raw = typeof w === 'string'
    ? w
    : (w.short_description ?? w.long_description ?? w.feature ?? w.risk ?? JSON.stringify(w))
  return WARNING_MAP[raw] ?? raw
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await requireOrg(supabase, user.id)

  const [candidateResult, verificationsResult, auditResult, clientsResult] =
    await Promise.all([
      supabase.from('candidates').select('*, clients(name)').eq('id', id).maybeSingle(),
      supabase.from('verifications').select('*').eq('candidate_id', id).order('created_at', { ascending: false }),
      supabase.from('audit_log').select('*').eq('candidate_id', id).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('name'),
    ])

  const candidate = candidateResult.data
  const allVerifications = verificationsResult.data
  const auditEntries = auditResult.data
  const clients = clientsResult.data ?? []

  if (!candidate) notFound()

  const verifications = (allVerifications ?? []) as Verification[]
  // Most recent per checkpoint. null-checkpoint rows are legacy C1 (checkpoint col was added later).
  const c1 = verifications.find(v => v.checkpoint === 'C1')
    ?? verifications.find(v => v.checkpoint === null)
    ?? null
  const c2 = verifications.find(v => v.checkpoint === 'C2') ?? null
  const c3 = verifications.find(v => v.checkpoint === 'C3') ?? null

  // C1 details for the identity sections
  const c1Decision = c1?.decision_json ?? null

  return (
    <div className="min-h-screen">
      <CandidateRefresher status={candidate.overall_status} />
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
            ← Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-medium">{candidate.full_name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{candidate.full_name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{candidate.email}</p>
              {candidate.phone && <p className="text-sm text-gray-500">{candidate.phone}</p>}
              {candidate.role_applied && (
                <p className="text-sm text-gray-600 mt-1">Role: {candidate.role_applied}</p>
              )}
              {candidate.clients && (
                <p className="text-sm text-gray-600">Client: {(candidate.clients as { name: string }).name}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <StatusBadge status={candidate.overall_status as CandidateStatus} />
              <CandidateDetailActions candidate={candidate} clients={clients} />
            </div>
          </div>

          {candidate.didit_session_id && (
            <div className="mt-4">
              <a
                href={`/api/candidates/${id}/pdf`}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download compliance PDF
              </a>
            </div>
          )}
        </div>

        {/* Verification timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Verification checkpoints</h3>
          </div>
          <CheckpointTimeline c1={c1} c2={c2} c3={c3} />

          {/* Show send-link box for any checkpoint that has a URL but isn't done */}
          <div className="mt-4 space-y-3">
            {[c1, c2, c3].filter(
              (v): v is Verification =>
                !!v &&
                !!v.session_url &&
                !['approved', 'declined'].includes(v.status)
            ).map(v => (
              <SendLinkBox
                key={v.id}
                sessionUrl={v.session_url!}
                candidateId={id}
                candidateName={candidate.full_name}
                candidateEmail={candidate.email}
                checkpoint={v.checkpoint ?? 'C1'}
              />
            ))}
          </div>

          {/* Checkpoint action buttons */}
          {c1?.status === 'approved' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {!c2 ? 'Next step: Interview check' :
                     c2.status === 'approved' && !c3 ? 'Next step: Offer check' :
                     'Send additional checks'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {!c2 ? 'C1 identity passed — send the C2 liveness check for the interview stage' :
                     c2.status === 'approved' && !c3 ? 'C2 passed — send the C3 check before making an offer' :
                     'Trigger C2 or C3 verification for this candidate'}
                  </p>
                </div>
              </div>
              <CheckpointActions
                candidateId={id}
                c1Approved={c1.status === 'approved'}
                c2Status={c2?.status ?? null}
                c3Status={c3?.status ?? null}
              />
            </div>
          )}
        </div>

        {/* C1 ID verification details */}
        {c1Decision?.id_verifications && c1Decision.id_verifications.length > 0 && (
          <CollapsibleSection title="C1 — ID Verification">
            {c1Decision.id_verifications.map((iv, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Name" value={iv.name} />
                <Field label="Document type" value={iv.document_type} />
                <Field label="Document number" value={iv.document_number} />
                <Field label="Date of birth" value={iv.dob} />
                <Field label="Nationality" value={iv.nationality} />
                <Field label="Expiration" value={iv.expiration} />
                {iv.warnings && iv.warnings.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-amber-700 mb-1">Document issues</p>
                    <ul className="space-y-0.5">
                      {iv.warnings.map((w, j) => (
                        <li key={j} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{humanizeWarning(w)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CollapsibleSection>
        )}

        {/* C1 Liveness */}
        {c1Decision?.liveness_checks && c1Decision.liveness_checks.length > 0 && (
          <Section title="C1 — Liveness">
            {c1Decision.liveness_checks.map((lc, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 text-sm">
                <Field label="Status" value={lc.status} />
                <Field label="Score" value={`${lc.score > 1 ? Math.round(lc.score) : Math.round(lc.score * 100)}%`} />
                <Field label="Method" value={lc.method} />
              </div>
            ))}
          </Section>
        )}

        {/* IP Analysis */}
        {c1Decision?.ip_analyses && c1Decision.ip_analyses.length > 0 && (
          <CollapsibleSection title="IP Analysis">
            {c1Decision.ip_analyses.slice(0, 1).map((ip, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 text-sm">
                <Field label="VPN" value={ip.vpn ? 'Yes' : 'No'} warn={ip.vpn} />
                <Field label="Proxy" value={ip.proxy ? 'Yes' : 'No'} warn={ip.proxy} />
                <Field label="Tor" value={ip.tor ? 'Yes' : 'No'} warn={ip.tor} />
                <Field label="Hosting" value={ip.hosting ? 'Yes' : 'No'} warn={ip.hosting} />
                <Field label="Risk score" value={ip.risk_score != null ? String(ip.risk_score) : undefined} />
              </div>
            ))}
          </CollapsibleSection>
        )}

        {/* AML */}
        {candidate.aml_enabled && c1Decision?.aml_screenings && c1Decision.aml_screenings.length > 0 && (
          <Section title="AML Screening">
            {c1Decision.aml_screenings.map((aml, i) => (
              <div key={i} className="text-sm space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status" value={aml.status} />
                  <Field label="Total hits" value={String(aml.total_hits)} warn={aml.total_hits > 0} />
                </div>
                {aml.hits && aml.hits.length > 0 && (
                  <div className="space-y-2">
                    {aml.hits.map((hit, j) => (
                      <div key={j} className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                        <p className="font-medium text-red-800">
                          {hit.name ?? hit.short_description ?? hit.feature ?? '—'}
                        </p>
                        <p className="text-red-700">
                          {[hit.match_type ?? hit.log_type, hit.risk, hit.categories?.join(', ')].filter(Boolean).join(' · ')}
                        </p>
                        {hit.long_description && (
                          <p className="text-red-600 mt-1">{hit.long_description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Audit trail */}
        {auditEntries && auditEntries.length > 0 && (
          <CollapsibleSection title="Audit trail">
            <div className="space-y-2">
              {auditEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-mono text-xs">{entry.action}</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="bg-white rounded-xl border border-gray-200 group">
      <summary className="px-6 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-6">{children}</div>
    </details>
  )
}

function Field({ label, value, warn }: { label: string; value?: string | null; warn?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value ?? '—'}</p>
    </div>
  )
}
