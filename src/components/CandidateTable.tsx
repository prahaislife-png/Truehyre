'use client'

import { useState, useMemo } from 'react'
import type { Candidate, Client } from '@/lib/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import AddCandidateModal from './AddCandidateModal'
import EditCandidateModal from './EditCandidateModal'

interface Props {
  candidates: Candidate[]
  clients: Client[]
  recruiterId: string
}

const ACTION_STATUSES = new Set(['pending', 'not_started', 'awaiting_user', 'in_progress', 'in_review', 'resubmitted'])
const COMPLETED_STATUSES = new Set(['approved', 'declined', 'abandoned', 'expired', 'kyc_expired'])

type Tab = 'all' | 'action' | 'completed' | 'failed'
type SortKey = 'full_name' | 'created_at' | 'overall_status'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 25

function exportCsv(rows: Candidate[]) {
  const header = ['Name', 'Email', 'Phone', 'Role', 'Client', 'Status', 'AML', 'Added']
  const lines = rows.map(c => [
    c.full_name,
    c.email,
    c.phone ?? '',
    c.role_applied ?? '',
    c.clients?.name ?? '',
    c.overall_status,
    c.aml_enabled ? 'Yes' : 'No',
    new Date(c.created_at).toLocaleDateString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `truehire-candidates-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <span className="ml-1 text-gray-300 text-xs">↕</span>
  return <span className="ml-1 text-blue-500 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function CandidateTable({ candidates, clients, recruiterId }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [filterClient, setFilterClient] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(candidates)
  const [resending, setResending] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const actionCount = rows.filter(c => ACTION_STATUSES.has(c.overall_status)).length
  const passedCount = rows.filter(c => c.overall_status === 'approved').length
  const failedCount = rows.filter(c => c.overall_status === 'declined').length

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = rows.filter(c => {
      if (tab === 'action' && !ACTION_STATUSES.has(c.overall_status)) return false
      if (tab === 'completed' && !COMPLETED_STATUSES.has(c.overall_status)) return false
      if (tab === 'failed' && c.overall_status !== 'declined') return false
      if (filterClient && c.client_id !== filterClient) return false
      if (search) {
        const q = search.toLowerCase()
        if (!c.full_name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false
      }
      return true
    })

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'full_name') cmp = a.full_name.localeCompare(b.full_name)
      else if (sortKey === 'created_at') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      else if (sortKey === 'overall_status') cmp = a.overall_status.localeCompare(b.overall_status)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [rows, tab, filterClient, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleAdded(c: Candidate) {
    setRows(prev => [c, ...prev])
    setShowAddModal(false)
  }

  function handleUpdated(c: Candidate) {
    setRows(prev => prev.map(r => r.id === c.id ? c : r))
    setEditCandidate(null)
  }

  async function handleResend(c: Candidate) {
    setResending(c.id)
    try {
      await fetch(`/api/candidates/${c.id}/resend-link`, { method: 'POST' })
      setResendSuccess(c.id)
      setTimeout(() => setResendSuccess(null), 3000)
    } finally {
      setResending(null)
    }
  }

  async function handleDelete(c: Candidate) {
    if (!confirm(`Delete ${c.full_name}? This cannot be undone.`)) return
    setDeleting(c.id)
    const res = await fetch(`/api/candidates/${c.id}`, { method: 'DELETE' })
    setDeleting(null)
    if (res.ok) setRows(prev => prev.filter(r => r.id !== c.id))
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'action', label: actionCount > 0 ? `Needs action (${actionCount})` : 'Needs action' },
    { key: 'completed', label: 'Completed' },
    { key: 'failed', label: failedCount > 0 ? `Failed (${failedCount})` : 'Failed' },
  ]

  if (rows.length === 0) {
    return (
      <>
        <div className="bg-white rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-4">
            <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold text-lg mb-2">Add your first candidate</p>
          <p className="text-sm text-gray-500 mb-1 max-w-sm mx-auto">Send them a government-ID verification link in under 30 seconds. No app required.</p>
          <p className="text-xs text-gray-400 mb-6">Results land in your dashboard in ~2 minutes.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
          >
            + Add first candidate
          </button>
        </div>
        {showAddModal && (
          <AddCandidateModal clients={clients} recruiterId={recruiterId} onClose={() => setShowAddModal(false)} onAdded={handleAdded} />
        )}
      </>
    )
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-start flex-wrap">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 w-48"
          />
          {clients.length > 0 && (
            <select
              value={filterClient}
              onChange={e => { setFilterClient(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            + Add candidate
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button className="flex items-center hover:text-gray-900 transition-colors" onClick={() => toggleSort('full_name')}>
                  Name <SortIcon column="full_name" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button className="flex items-center hover:text-gray-900 transition-colors" onClick={() => toggleSort('overall_status')}>
                  Status <SortIcon column="overall_status" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button className="flex items-center hover:text-gray-900 transition-colors" onClick={() => toggleSort('created_at')}>
                  Added <SortIcon column="created_at" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">No candidates match your filters</td>
              </tr>
            ) : (
              paginated.map(c => {
                const needsAction = ACTION_STATUSES.has(c.overall_status)
                const isResending = resending === c.id
                const didResend = resendSuccess === c.id
                const isDeleting = deleting === c.id
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors group ${needsAction ? 'border-l-2 border-l-blue-400' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {needsAction && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                        {c.full_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500">{c.role_applied ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.clients?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.overall_status as any} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {needsAction && (
                          <button
                            onClick={() => handleResend(c)}
                            disabled={isResending}
                            title="Resend verification link"
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              didResend
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            {didResend ? '✓ Sent' : isResending ? '…' : (
                              <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Resend
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setEditCandidate(c)}
                          title="Edit candidate"
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <Link
                          href={`/candidates/${c.id}`}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={isDeleting}
                          title="Delete candidate"
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {paginated.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No candidates match your filters</p>
        ) : (
          paginated.map(c => {
            const needsAction = ACTION_STATUSES.has(c.overall_status)
            return (
              <div key={c.id} className={`bg-white rounded-xl border px-4 py-3 ${needsAction ? 'border-l-4 border-l-blue-400 border-gray-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                    {c.role_applied && <p className="text-xs text-gray-400 mt-0.5">{c.role_applied}</p>}
                  </div>
                  <StatusBadge status={c.overall_status as any} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {needsAction && (
                    <button
                      onClick={() => handleResend(c)}
                      disabled={resending === c.id}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium"
                    >
                      {resendSuccess === c.id ? '✓ Sent' : 'Resend link'}
                    </button>
                  )}
                  <button onClick={() => setEditCandidate(c)} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">Edit</button>
                  <Link href={`/candidates/${c.id}`} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">View</Link>
                  <button onClick={() => handleDelete(c)} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-500 font-medium">Delete</button>
                </div>
              </div>
            )
          })
        )}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-gray-600 disabled:opacity-40">← Prev</button>
            <span className="text-sm text-gray-500">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm text-gray-600 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCandidateModal clients={clients} recruiterId={recruiterId} onClose={() => setShowAddModal(false)} onAdded={handleAdded} />
      )}
      {editCandidate && (
        <EditCandidateModal candidate={editCandidate} clients={clients} onClose={() => setEditCandidate(null)} onUpdated={handleUpdated} />
      )}
    </>
  )
}
