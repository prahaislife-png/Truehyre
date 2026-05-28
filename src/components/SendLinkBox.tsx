'use client'

import { useState } from 'react'

interface Props {
  sessionUrl: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  checkpoint: 'C1' | 'C2' | 'C3'
}

const LABELS: Record<string, string> = {
  C1: 'Identity verification',
  C2: 'Interview check',
  C3: 'Offer check',
}

export default function SendLinkBox({ sessionUrl, candidateId, candidateName, candidateEmail, checkpoint }: Props) {
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [verifyUrl, setVerifyUrl] = useState(sessionUrl)
  const label = LABELS[checkpoint]

  async function copy() {
    await navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function refreshSession() {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/candidates/${candidateId}/refresh-session`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Failed to refresh session')
        return
      }
      const data = await res.json()
      setVerifyUrl(data.session_url)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="text-sm font-semibold text-blue-900">Send {label} link to {candidateName}</p>
        </div>
        {checkpoint === 'C1' && (
          <button
            onClick={refreshSession}
            disabled={refreshing}
            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            title="Generate a new link if the current one has expired"
          >
            {refreshing ? 'Refreshing…' : 'Refresh link'}
          </button>
        )}
      </div>

      <p className="text-xs text-blue-700">
        The candidate opens this link on their phone and completes the verification. You'll see the result here automatically.
      </p>

      <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 break-all">
        {verifyUrl}
      </div>

      <div className="flex gap-2">
        <button
          onClick={copy}
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy link'}
        </button>
        <a
          href={`mailto:${candidateEmail}?subject=${encodeURIComponent(`${label} — action required`)}&body=${encodeURIComponent(`Hi ${candidateName},\n\nPlease complete your ${label.toLowerCase()} for your job application:\n\n${verifyUrl}\n\nIt takes about 2 minutes on your phone. No app needed.`)}`}
          className="flex-1 text-center rounded-lg border border-blue-200 bg-white py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
        >
          Email
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Hi ${candidateName}, please complete your ${label.toLowerCase()} for your job application: ${verifyUrl} — takes ~2 min on your phone, no app needed.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center rounded-lg border border-blue-200 bg-white py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
        >
          WhatsApp
        </a>
      </div>
    </div>
  )
}
