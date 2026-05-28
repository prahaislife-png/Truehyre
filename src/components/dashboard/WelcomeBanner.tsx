'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Props {
  orgName: string
  userEmail: string
  initials: string
  totalCandidates: number
  isAdmin: boolean
}

export default function WelcomeBanner({ orgName, userEmail, initials, totalCandidates, isAdmin }: Props) {
  const firstName = userEmail.split('@')[0].split('.')[0]
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  return (
    <section className="relative overflow-hidden rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2744 50%, #1a3a6e 100%)' }}>
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(96,165,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Live</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Welcome back, <span className="text-blue-300">{name}</span>
            </h2>
            <p className="text-white/50 text-sm">
              {orgName} · {totalCandidates} candidate{totalCandidates !== 1 ? 's' : ''} in your pipeline
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            {isAdmin && (
              <Link
                href="/settings/team"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Team
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
