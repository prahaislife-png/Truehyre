import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireOrg } from '@/lib/requireOrg'
import StatusBadge from '@/components/StatusBadge'
import CheckpointTimeline from '@/components/CheckpointTimeline'
import CheckpointActions from '@/components/CheckpointActions'
import SendLinkBox from '@/components/SendLinkBox'
import CandidateRefresher from '@/components/CandidateRefresher'
import CandidateDetailActions from '@/components/CandidateDetailActions'
import CandidateVerificationOptions from '@/components/CandidateVerificationOptions'
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

function extractFaceImageUrls(v: Verification): { selfie: string | null; ref: string | null } {
  const fm = v.decision_json?.face_matches?.[0]
  const images = fm?.images as Record<string, string> | undefined
  let selfie: string | null = null
  if (images) {
    for (const k of ['user_image', 'selfie', 'live_image', 'capture']) {
      if (images[k]) { selfie = images[k]; break }
    }
  }
  // Fall back to liveness image
  if (!selfie) {
    const lc = v.decision_json?.liveness_checks?.[0] as Record<string, unknown> | undefined
    selfie = (lc?.image_url ?? lc?.selfie_url ?? null) as string | null
  }
  const ref = (images?.ref_image ?? images?.reference ?? v.reference_image_url) ?? null
  return { selfie, ref }
}

function proxyUrl(url: string | null): string | null {
  if (!url) return null
  return `/api/image-proxy?url=${encodeURIComponent(url)}`
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

  // Resolve duplicate candidate name for any flagged recheck
  const duplicateCandidateId = c2?.duplicate_candidate_id ?? c3?.duplicate_candidate_id ?? null
  let duplicateNames: Record<string, string> = {}
  if (duplicateCandidateId) {
    const { data: dup } = await supabase.from('candidates').select('id, full_name').eq('id', duplicateCandidateId).maybeSingle()
    if (dup) duplicateNames = { [dup.id]: dup.full_name }
  }

  // Face images for C2/C3 (proxied)
  const c2Images = c2 ? extractFaceImageUrls(c2) : null
  const c3Images = c3 ? extractFaceImageUrls(c3) : null
  const c1RefImageUrl = proxyUrl(c1?.reference_image_url ?? null)

  // Whether any checkpoint has a duplicate face alert
  const hasDuplicateAlert = !!(c2?.duplicate_face_flag || c3?.duplicate_face_flag)

  // C1 details for the identity sections
  const c1Decision = c1?.decision_json ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateRefresher status={candidate.overall_status} />

      {/* Sticky nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <span className="text-gray-200">/</span>
            <span className="font-semibold text-gray-800">{candidate.full_name}</span>
          </div>
          {candidate.didit_session_id && (
            <a
              href={`/api/candidates/${id}/pdf`}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ─── Fraud alert banner ─── */}
        {hasDuplicateAlert && (
          <div className="bg-red-600 text-white rounded-2xl px-6 py-4 flex items-start gap-4 shadow-lg">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-base">Duplicate Face Detected</p>
              <p className="text-sm text-red-100 mt-0.5">
                This candidate&apos;s biometric selfie matched a different candidate in your database.
                {duplicateCandidateId && duplicateNames[duplicateCandidateId] && (
                  <> Matched: <Link href={`/candidates/${duplicateCandidateId}`} className="underline font-semibold text-white hover:text-red-200">{duplicateNames[duplicateCandidateId]}</Link>.</>
                )}
                {' '}Do not proceed without manual review.
              </p>
            </div>
          </div>
        )}

        {/* ─── Hero card: profile + checkpoints unified ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

          {/* Top strip: candidate identity */}
          <div className="px-7 pt-7 pb-5 flex items-start justify-between gap-4 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-black text-lg">
                  {candidate.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">{candidate.full_name}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-sm text-gray-500">{candidate.email}</span>
                  {candidate.phone && <span className="text-sm text-gray-400">· {candidate.phone}</span>}
                  {candidate.role_applied && <span className="text-sm text-gray-500">· {candidate.role_applied}</span>}
                  {candidate.clients && <span className="text-sm text-gray-400">· {(candidate.clients as { name: string }).name}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <StatusBadge status={candidate.overall_status as CandidateStatus} />
              <CandidateDetailActions candidate={candidate} clients={clients} />
            </div>
          </div>

          {/* Checkpoint section — the main event */}
          <div className="px-7 py-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Verification Checkpoints</p>

            <CheckpointTimeline c1={c1} c2={c2} c3={c3} duplicateNames={duplicateNames} />

            {/* Send link boxes for active checkpoints */}
            {[c1, c2, c3].filter(
              (v): v is Verification =>
                !!v && !!v.session_url && !['approved', 'declined'].includes(v.status)
            ).map(v => (
              <div key={v.id} className="mt-4">
                <SendLinkBox
                  sessionUrl={v.session_url!}
                  candidateId={id}
                  candidateName={candidate.full_name}
                  candidateEmail={candidate.email}
                  checkpoint={v.checkpoint ?? 'C1'}
                />
              </div>
            ))}

            {/* Next step actions */}
            {c1?.status === 'approved' && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {!c2 ? '→ Next: Send Interview check (C2)' :
                       c2.status === 'approved' && !c3 ? '→ Next: Send Offer check (C3)' :
                       'Trigger additional checks'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {!c2 ? 'C1 passed — trigger liveness check before the interview starts' :
                       c2.status === 'approved' && !c3 ? 'C2 passed — trigger final re-verification at offer stage' :
                       'Manually trigger the next checkpoint'}
                    </p>
                  </div>
                  <CheckpointActions
                    candidateId={id}
                    c1Approved={c1.status === 'approved'}
                    c2Status={c2?.status ?? null}
                    c3Status={c3?.status ?? null}
                  />
                </div>
              </div>
            )}

            {/* Verification options (Proof of Address + Database Validation) */}
            <CandidateVerificationOptions
              candidateId={id}
              poaEnabled={candidate.proof_of_address_enabled}
              dbEnabled={candidate.database_validation_enabled}
              c1Status={c1?.status ?? null}
            />
          </div>
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

        {/* C2 Face match images */}
        {c2 && c2.face_match_score != null && (
          <CollapsibleSection title="C2 — Face Match">
            <FaceMatchPanel
              matchScore={c2.face_match_score}
              isDuplicate={c2.duplicate_face_flag}
              duplicateName={c2.duplicate_candidate_id ? (duplicateNames[c2.duplicate_candidate_id] ?? null) : null}
              duplicateId={c2.duplicate_candidate_id}
              selfieUrl={proxyUrl(c2Images?.selfie ?? null)}
              refUrl={c1RefImageUrl}
            />
          </CollapsibleSection>
        )}

        {/* C3 Face match images */}
        {c3 && c3.face_match_score != null && (
          <CollapsibleSection title="C3 — Face Match">
            <FaceMatchPanel
              matchScore={c3.face_match_score}
              isDuplicate={c3.duplicate_face_flag}
              duplicateName={c3.duplicate_candidate_id ? (duplicateNames[c3.duplicate_candidate_id] ?? null) : null}
              duplicateId={c3.duplicate_candidate_id}
              selfieUrl={proxyUrl(c3Images?.selfie ?? null)}
              refUrl={c1RefImageUrl}
            />
          </CollapsibleSection>
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

function FaceMatchPanel({
  matchScore,
  isDuplicate,
  duplicateName,
  duplicateId,
  selfieUrl,
  refUrl,
}: {
  matchScore: number
  isDuplicate: boolean
  duplicateName: string | null
  duplicateId: string | null
  selfieUrl: string | null
  refUrl: string | null
}) {
  const pct = Math.round(matchScore * 100)
  const color = isDuplicate ? 'text-red-600' : pct >= 70 ? 'text-green-700' : pct >= 50 ? 'text-yellow-700' : 'text-red-600'

  return (
    <div className="space-y-4">
      {isDuplicate && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-800">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Duplicate face detected.</strong>
            {duplicateId && (
              <> Matched: <Link href={`/candidates/${duplicateId}`} className="underline font-semibold hover:text-red-900">{duplicateName ?? duplicateId}</Link>.</>
            )}
          </span>
        </div>
      )}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Match score</p>
          <p className={`text-3xl font-black ${color}`}>{pct}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Verdict</p>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
            isDuplicate ? 'bg-red-100 text-red-800 border-red-300' :
            pct >= 70   ? 'bg-green-100 text-green-800 border-green-300' :
                          'bg-red-100 text-red-800 border-red-300'
          }`}>
            {isDuplicate ? 'DUPLICATE' : pct >= 70 ? 'MATCH' : 'NO MATCH'}
          </span>
        </div>
      </div>
      {(selfieUrl || refUrl) && (
        <div className="grid grid-cols-2 gap-4">
          {selfieUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">New selfie (this check)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfieUrl} alt="New selfie" className="w-full rounded-xl border border-gray-200 object-cover aspect-[3/4]" />
            </div>
          )}
          {refUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Reference selfie (C1)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={refUrl} alt="C1 reference" className="w-full rounded-xl border border-gray-200 object-cover aspect-[3/4]" />
            </div>
          )}
        </div>
      )}
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
