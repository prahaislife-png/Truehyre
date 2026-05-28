'use client'

import { useState } from 'react'
import type { Candidate, Client } from '@/lib/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import AddCandidateModal from './AddCandidateModal'

interface Props {
  candidates: Candidate[]
  clients: Client[]
  recruiterId: string
}

const ACTION_STATUSES = new Set(['pending', 'not_started', 'awaiting_user', 'in_progress', 'in_review', 'resubmitted'])
const COMPLETED_STATUSES = new Set(['approved', 'declined', 'abandoned', 'expired', 'kyc_expired'])

type Tab = 'all' | 'action' | 'completed'

function sortRows(rows: Candidate[]): Candidate[] {
  return [...rows].sort((a, b) => {
    const aAction = ACTION_STATUSES.has(a.overall_status) ? 0 : 1
    const bAction = ACTION_STATUSES.has(b.overall_status) ? 0 : 1
    return aAction - bAction
  })
}

export default function CandidateTable({ candidates, clients, recruiterId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [filterClient, setFilterClient] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [rows, setRows] = useState(candidates)

  const actionCount = rows.filter(c => ACTION_STATUSES.has(c.overall_status)).length
  const passedCount = rows.filter(c => c.overall_status === 'approved').length
  const failedCount = rows.filter(c => c.overall_status === 'declined').length

  const filtered = sortRows(
    rows.filter(c => {
      if (tab === 'action' && !ACTION_STATUSES.has(c.overall_status)) return false
      if (tab === 'completed' && !COMPLETED_STATUSES.has(c.overall_status)) return false
      if (filterClient && c.client_id !== filterClient) return false
      if (search && !c.full_name.toLowerCase().includes(search.toLowerCase()) &&
          !c.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  )

  function handleAdded(candidate: Candidate) {
    setRows(prev => [candidate, ...prev])
    setShowModal(false)
  }

  if (rows.length === 0) {
    return (
      <>
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold text-base">No candidates yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">Add your first candidate to kick off a verification</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add first candidate
          </button>
        </div>
        {showModal && (
          <AddCandidateModal
            clients={clients}
            recruiterId={recruiterId}
            onClose={() => setShowModal(false)}
            onAdded={handleAdded}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* Stat bar */}
      <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
        {actionCount > 0 ? (
          <button
            onClick={() => setTab('action')}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1 font-medium hover:bg-blue-100 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            {actionCount} need action
          </button>
        ) : (
          <span className="text-gray-400 text-sm">0 need action</span>
        )}
        <span className="text-gray-200">·</span>
        <span className="text-gray-500">
          <span className="text-green-600 font-semibold">{passedCount}</span> passed
        </span>
        <span className="text-gray-200">·</span>
        <span className="text-gray-500">
          <span className="text-red-500 font-semibold">{failedCount}</span> failed
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 flex-wrap">
          {/* Tab filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-start">
            {([
              { key: 'all' as Tab, label: 'All' },
              { key: 'action' as Tab, label: actionCount > 0 ? `Needs action (${actionCount})` : 'Needs action' },
              { key: 'completed' as Tab, label: 'Completed' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 sm:w-52"
          />
          {clients.length > 0 && (
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Add candidate
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No candidates match your filters
                </td>
              </tr>
            ) : (
              filtered.map(c => {
                const needsAction = ACTION_STATUSES.has(c.overall_status)
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-gray-50 transition-colors ${needsAction ? 'border-l-2 border-l-blue-400' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {c.full_name}
                      {needsAction && (
                        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{c.role_applied ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.clients?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.overall_status as any} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/candidates/${c.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No candidates match your filters</p>
        ) : (
          filtered.map(c => {
            const needsAction = ACTION_STATUSES.has(c.overall_status)
            return (
              <Link
                key={c.id}
                href={`/candidates/${c.id}`}
                className={`block bg-white rounded-xl border px-4 py-3 ${needsAction ? 'border-l-4 border-l-blue-400 border-gray-200' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                    {c.role_applied && <p className="text-xs text-gray-400 mt-0.5">{c.role_applied}</p>}
                  </div>
                  <StatusBadge status={c.overall_status as any} />
                </div>
              </Link>
            )
          })
        )}
      </div>

      {showModal && (
        <AddCandidateModal
          clients={clients}
          recruiterId={recruiterId}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </>
  )
}
