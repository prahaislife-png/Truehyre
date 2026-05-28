'use client'

import Link from 'next/link'

export default function CandidateError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-300 mb-4">Error</p>
        <h1 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6">
          {error.message ?? 'Failed to load candidate profile.'}
        </p>
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
          <span className="text-gray-300">·</span>
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
