import Link from 'next/link'

export default function CandidateNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-300 mb-4">404</p>
        <h1 className="text-lg font-semibold text-gray-800 mb-2">Candidate not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          This candidate may have been deleted or you don't have access to it.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
