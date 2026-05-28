'use client'

import { useState } from 'react'
import type { Candidate, Client } from '@/lib/types'

interface Props {
  clients: Client[]
  recruiterId: string
  onClose: () => void
  onAdded: (candidate: Candidate) => void
}

export default function AddCandidateModal({ clients, onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role_applied: '',
    client_id: '',
    aml_enabled: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionUrl, setSessionUrl] = useState('')
  const [copied, setCopied] = useState(false)

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    setSessionUrl(data.session_url)
    onAdded(data.candidate)
    setLoading(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(sessionUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const consentUrl = `${window.location.origin}/consent/${sessionUrl.split('/').pop()}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
        {!sessionUrl ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Add candidate</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                <input required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role applied for</label>
                <input value={form.role_applied} onChange={e => set('role_applied', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select value={form.client_id} onChange={e => set('client_id', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">No client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.aml_enabled} onChange={e => set('aml_enabled', e.target.checked)}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Enable AML screening</span>
              </label>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Creating…' : 'Create & get link'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Verification link ready</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send this consent link to the candidate. They will review the data-processing notice before being directed to Didit for verification.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 break-all text-sm font-mono text-gray-700">
              {consentUrl}
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={copyLink}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <a href={`mailto:?subject=Identity Verification Required&body=Please complete your identity verification: ${consentUrl}`}
                className="flex-1 text-center rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 transition-colors">
                Send email
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Please complete your identity verification: ${consentUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 transition-colors">
                WhatsApp
              </a>
            </div>
            <button onClick={onClose}
              className="w-full rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 transition-colors">
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}
