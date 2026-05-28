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

export default function CandidateTable({ candidates, clients, recruiterId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [filterClient, setFilterClient] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [rows, setRows] = useState(candidates)

  const filtered = rows.filter(c => {
    if (filterClient && c.client_id !== filterClient) return false
    if (filterStatus && c.overall_status !== filterStatus) return false
    return true
  })

  function handleAdded(candidate: Candidate) {
    setRows(prev => [candidate, ...prev])
    setShowModal(false)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
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
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">Review</option>
            <option value="approved">Pass</option>
            <option value="declined">Fail</option>
            <option value="abandoned">Abandoned</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add candidate
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">No candidates found</td>
              </tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{c.full_name}</td>
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
                  <Link
                    href={`/candidates/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
