'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to TrueHire</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Set up your workspace to start verifying candidates.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company / workspace name
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. ThoughtsON Technologies"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-xs text-gray-400 mt-1">This is your team&apos;s workspace name. You can change it later.</p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 2px 12px rgba(37,99,235,0.35)' }}
          >
            {loading ? 'Creating workspace…' : 'Create workspace →'}
          </button>
        </form>
      </div>
    </div>
  )
}
