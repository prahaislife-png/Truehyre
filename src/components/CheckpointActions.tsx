'use client'

import { useState } from 'react'

interface Props {
  candidateId: string
  c1Approved: boolean
  c2Status: string | null  // null = not initiated
  c3Status: string | null
}

const PENDING_STATUSES = ['not_started', 'in_progress', 'awaiting_user']

export default function CheckpointActions({ candidateId, c1Approved, c2Status, c3Status }: Props) {
  const [loading, setLoading] = useState<'C2' | 'C3' | null>(null)
  const [sessionUrl, setSessionUrl] = useState<{ checkpoint: string; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const canRunC2 = c1Approved && !PENDING_STATUSES.includes(c2Status ?? '')
  const canRunC3 = c1Approved && !PENDING_STATUSES.includes(c3Status ?? '')

  async function trigger(checkpoint: 'C2' | 'C3') {
    setLoading(checkpoint)
    setError(null)
    setSessionUrl(null)
    try {
      const res = await fetch(`/api/candidates/${candidateId}/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpoint }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create session')
      } else {
        setSessionUrl({ checkpoint, url: data.session_url as string })
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(null)
    }
  }

  async function copyUrl() {
    if (!sessionUrl) return
    await navigator.clipboard.writeText(sessionUrl.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!c1Approved) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => trigger('C2')}
          disabled={!canRunC2 || loading === 'C2'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading === 'C2' ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882V15.12a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          Send interview check (C2)
        </button>

        <button
          onClick={() => trigger('C3')}
          disabled={!canRunC3 || loading === 'C3'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading === 'C3' ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          Send offer check (C3)
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {sessionUrl && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-800">{sessionUrl.checkpoint} link ready — send to candidate:</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={sessionUrl.url}
              className="flex-1 rounded border border-blue-200 bg-white px-2 py-1 text-xs font-mono text-gray-700 truncate"
            />
            <button
              onClick={copyUrl}
              className="flex-shrink-0 rounded border border-blue-300 bg-white px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-2">
            <a
              href={`mailto:?subject=Identity Verification Required&body=Please complete your identity verification: ${sessionUrl.url}`}
              className="flex-1 text-center rounded border border-blue-200 bg-white py-1 text-xs text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Email
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Please complete your identity verification: ${sessionUrl.url}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center rounded border border-blue-200 bg-white py-1 text-xs text-blue-700 hover:bg-blue-50 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
