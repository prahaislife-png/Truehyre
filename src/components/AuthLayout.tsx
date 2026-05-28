'use client'

/* ─── Left-panel data ────────────────────────────────── */

const trustBadges = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    label: '220+ countries',
    sub: 'Global ID coverage',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: '~2 min verification',
    sub: 'No app required',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    label: '3-stage checkpoints',
    sub: 'Apply · Interview · Offer',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Recruiter-ready reports',
    sub: 'Pass / Review / Fail',
  },
]

const flowSteps = [
  {
    n: '01',
    title: 'Add Candidate',
    desc: 'Enter name, email, and role. Done in under 30 seconds.',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.15)',
    border: 'rgba(96,165,250,0.3)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Send Verification Link',
    desc: 'One click — via email, WhatsApp, or copy-paste to any channel.',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.15)',
    border: 'rgba(167,139,250,0.3)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Candidate Completes ID + Selfie',
    desc: 'Government ID scan and live selfie on their phone. ~2 minutes, no app needed.',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.15)',
    border: 'rgba(251,191,36,0.3)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
  },
  {
    n: '04',
    title: 'Review Pass / Manual Review / Fail',
    desc: 'Instant verdict with liveness score, face match %, AML status, and downloadable PDF.',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.3)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

const teamTypes = [
  'Staffing Agencies',
  'Recruiter On-Demand Teams',
  'IT Services Companies',
  'Global Hiring Teams',
  'Early Talent Programs',
  'Contract Staffing',
]

/* ─── Component ─────────────────────────────────────── */

export default function AuthLayout({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode
  heading: string
  subheading: string
}) {
  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════════════════
          LEFT PANEL — marketing / hero
      ══════════════════════════════════════════════════ */}
      <div
        className="hidden lg:block lg:w-[58%] relative overflow-y-auto"
        style={{
          background: 'linear-gradient(155deg, #0c1d4a 0%, #122560 25%, #163080 55%, #1a3d9f 80%, #1e4ab8 100%)',
        }}
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{ top: '-120px', right: '-120px', width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-80px', left: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ top: '45%', left: '55%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 65%)', borderRadius: '50%' }} />

        {/* ── Scrollable content ── */}
        <div className="relative z-10 px-10 pt-10 pb-12 space-y-7 max-w-[520px]">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(10px)' }}
            >
              <svg className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-white font-bold text-[17px] tracking-tight">TrueHire</span>
            <span
              className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.25)' }}
            >
              LIVE
            </span>
          </div>

          {/* ── Hero headline ── */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6ee7b7' }} />
              <span className="text-white/75 text-[11px] font-semibold tracking-widest uppercase">Identity Verification Platform</span>
            </div>

            <h2
              className="font-extrabold text-white leading-[1.1] tracking-tight mb-3"
              style={{ fontSize: '34px' }}
            >
              Verify Candidates<br />
              <span style={{ color: '#bfdbfe' }}>Before You Hire.</span>
            </h2>

            <p className="text-white/60 text-[14px] leading-relaxed" style={{ maxWidth: 420 }}>
              TrueHire helps recruiters confirm candidate identity across application, interview, and offer stages — with fast ID, selfie, and liveness verification built into the hiring lifecycle.
            </p>
          </div>

          {/* ── Trust badges 2×2 grid ── */}
          <div className="grid grid-cols-2 gap-2.5">
            {trustBadges.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-200"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                  {b.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-[12px] font-bold leading-tight truncate">{b.label}</p>
                  <p className="text-white/45 text-[10px] mt-0.5 leading-none">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Verification flow card ── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #60a5fa, #34d399)' }} />
              <p className="text-white/80 text-[11px] font-bold tracking-widest uppercase">Verification Flow</p>
            </div>

            <div className="space-y-0">
              {flowSteps.map((s, i) => (
                <div key={i} className="flex gap-3.5 relative">
                  {/* Vertical connector line */}
                  {i < flowSteps.length - 1 && (
                    <div
                      className="absolute"
                      style={{
                        left: 15,
                        top: 32,
                        bottom: 0,
                        width: 1,
                        background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 4px, transparent 4px, transparent 8px)',
                      }}
                    />
                  )}

                  {/* Step icon circle */}
                  <div
                    className="flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center z-10 mt-0.5"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
                  >
                    {s.icon}
                  </div>

                  {/* Step content */}
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.n}</span>
                      <p className="text-white text-[13px] font-semibold leading-snug">{s.title}</p>
                    </div>
                    <p className="text-white/45 text-[11px] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Built for hiring teams ── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(14px)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #a78bfa, #60a5fa)' }} />
              <p className="text-white/80 text-[11px] font-bold tracking-widest uppercase">Built for hiring teams</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamTypes.map((t, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.75)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── About TrueHire ── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.11)', backdropFilter: 'blur(14px)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #f87171)' }} />
              <p className="text-white/80 text-[11px] font-bold tracking-widest uppercase">About TrueHire</p>
            </div>
            <p className="text-white/55 text-[12.5px] leading-relaxed">
              TrueHire is built for recruitment teams that need speed without losing trust. It brings identity verification into the hiring lifecycle so teams can reduce impersonation risk, improve candidate confidence, and make faster, better-informed hiring decisions — at every stage.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { v: '15+', l: 'Years in talent' },
                { v: '220+', l: 'Countries' },
                { v: '3×', l: 'Hiring stages' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl py-2.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <p className="text-white font-extrabold text-[18px] leading-none">{s.v}</p>
                  <p className="text-white/40 text-[10px] mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom strip ── */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-white/35 text-[11px] leading-relaxed">
              Inspired by modern talent operations, AI HR automation, and global recruitment workflows.
            </p>
          </div>

          <p className="text-white/20 text-[11px] pb-2">© 2026 TrueHire · Verified hiring for a remote-first world</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL — login / signup form (unchanged)
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-6 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 tracking-tight">TrueHire</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[360px]">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{heading}</h1>
              <p className="mt-1.5 text-sm text-gray-500">{subheading}</p>
            </div>
            {children}
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-xs text-gray-400">Secured by enterprise-grade biometric verification</p>
        </div>
      </div>

    </div>
  )
}
