'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Member {
  id: string
  email: string
  role: string
}

interface PendingInvite {
  id: string
  email: string
  role: string
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('recruiter')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: membersData } = await supabase
        .from('users')
        .select('id, email, role')
        .order('email')
      setMembers(membersData ?? [])

      const res = await fetch('/api/invitations')
      if (res.ok) {
        const { invitations } = await res.json()
        setInvites(invitations.filter((i: PendingInvite) => !i.accepted_at))
      }
    }
    load()
  }, [])

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to send invite')
    } else {
      setSuccess(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      // Refresh pending list
      const res2 = await fetch('/api/invitations')
      if (res2.ok) {
        const { invitations } = await res2.json()
        setInvites(invitations.filter((i: PendingInvite) => !i.accepted_at))
      }
    }
    setSending(false)
  }

  const roleLabel = (r: string) =>
    r === 'admin' ? 'Admin' : r === 'client_viewer' ? 'Client Viewer' : 'Recruiter'

  const roleBadge = (r: string) => {
    const base = 'inline-block text-xs font-medium rounded-full px-2 py-0.5 '
    if (r === 'admin') return base + 'bg-purple-100 text-purple-700'
    if (r === 'client_viewer') return base + 'bg-gray-100 text-gray-600'
    return base + 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-medium">Team</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Members</h2>
          <div className="divide-y divide-gray-100">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-800">{m.email}</span>
                <span className={roleBadge(m.role)}>{roleLabel(m.role)}</span>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-gray-400 py-3">No members yet.</p>
            )}
          </div>
        </div>

        {/* Invite */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Invite teammate</h2>
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          {success && (
            <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</div>
          )}
          <form onSubmit={sendInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
                <option value="client_viewer">Client Viewer</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {sending ? 'Sending…' : 'Send invite'}
            </button>
          </form>
        </div>

        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Pending invitations</h2>
            <div className="divide-y divide-gray-100">
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-800">{inv.email}</p>
                    <p className="text-xs text-gray-400">
                      Invited {new Date(inv.created_at).toLocaleDateString()} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={roleBadge(inv.role)}>{roleLabel(inv.role)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
