'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Candidate, Client } from '@/lib/types'
import EditCandidateModal from './EditCandidateModal'

interface Props {
  candidate: Candidate
  clients: Client[]
}

export default function CandidateDetailActions({ candidate, clients }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete ${candidate.full_name}? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/candidates/${candidate.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) router.push('/dashboard')
  }

  function handleUpdated() {
    setShowEdit(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {showEdit && (
        <EditCandidateModal
          candidate={candidate}
          clients={clients}
          onClose={() => setShowEdit(false)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  )
}
