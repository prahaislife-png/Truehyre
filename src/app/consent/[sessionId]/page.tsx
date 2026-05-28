'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { COMPANY_NAME, CONSENT_NOTICE } from '@/lib/config/verification'

export default function ConsentPage() {
  const params = useParams()
  const sessionToken = params.sessionId as string
  const diditUrl = `https://verify.didit.me/u/${sessionToken}`
  const [loading, setLoading] = useState(false)

  async function proceed() {
    setLoading(true)
    const cid = new URLSearchParams(window.location.search).get('cid')
    if (cid) {
      try {
        await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: cid }),
        })
      } catch {
        // best-effort — don't block the candidate
      }
    }
    window.location.href = diditUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8 text-center">
        {/* Shield icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-5">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-base font-semibold text-gray-900 mb-3">{COMPANY_NAME}</h1>

        <p className="text-sm text-gray-600 leading-relaxed mb-7">{CONSENT_NOTICE}</p>

        <button
          onClick={proceed}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Starting…' : 'Continue'}
        </button>

        <p className="mt-4 text-xs text-gray-400">Powered by Didit · Encrypted in transit</p>
      </div>
    </div>
  )
}
