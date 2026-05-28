'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import { useSearchParams } from 'next/navigation'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const callbackUrl = inviteToken
      ? `${window.location.origin}/auth/callback?invite=${inviteToken}`
      : `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthLayout heading="Check your inbox" subheading="One more step to get started">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '1px solid #86efac' }}>
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-1">
            We sent a confirmation link to
          </p>
          <p className="text-sm font-semibold text-gray-900 mb-6">{email}</p>
          <p className="text-xs text-gray-400 mb-8">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
          <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Create your account" subheading="Start verifying candidates in minutes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: loading ? 'none' : '0 2px 12px rgba(37,99,235,0.35)' }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account…
            </>
          ) : 'Create free account'}
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          By signing up you agree to our terms of service and privacy policy.
        </p>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
