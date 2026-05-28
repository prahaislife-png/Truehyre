'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ConsentPage() {
  const params = useParams()
  const sessionToken = params.sessionId as string
  const [accepted, setAccepted] = useState(false)

  // The session token here is the last path segment of the Didit URL
  // We reconstruct the full Didit hosted URL
  const diditUrl = `https://verify.didit.me/u/${sessionToken}`

  function proceed() {
    window.location.href = diditUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Identity Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Powered by TrueHire &amp; Didit</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-900 space-y-2">
          <p className="font-medium">Data processing notice</p>
          <p>
            To verify your identity, we will collect and process the following data on your behalf:
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Government-issued photo ID (document scan)</li>
            <li>Liveness selfie (passive check — no active movement needed)</li>
            <li>Face match between your ID and selfie</li>
            <li>IP address analysis</li>
          </ul>
          <p>
            This data is transferred to <strong>Didit</strong> (didit.me), a regulated identity verification provider, solely for the purpose of confirming your identity for this job application. Your data is processed in accordance with applicable data protection regulations.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            I have read and understood the data processing notice above and consent to my data being processed for identity verification purposes.
          </span>
        </label>

        <button
          onClick={proceed}
          disabled={!accepted}
          className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continue to verification
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Your data is encrypted in transit and at rest.
        </p>
      </div>
    </div>
  )
}
