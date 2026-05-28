'use client'

const steps = [
  { n: '1', title: 'Add the candidate', desc: 'Name, email, role — 30 seconds in the dashboard.' },
  { n: '2', title: 'Send the verification link', desc: 'One click. Via email, WhatsApp, or copy-paste.' },
  { n: '3', title: 'Candidate verifies on their phone', desc: 'Government ID + live selfie. ~2 minutes. No app needed.' },
  { n: '4', title: 'See Pass / Review / Fail instantly', desc: 'Full report with liveness score, face match, and PDF.' },
]

const pillars = [
  {
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.2)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    label: '220+ countries',
    sub: 'Global ID coverage',
  },
  {
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.2)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: '~2 minutes',
    sub: 'Candidate completes',
  },
  {
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.2)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    label: '3 checkpoints',
    sub: 'Submit · Interview · Offer',
  },
]

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
      {/* ── Left panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #1040a0 0%, #1a52c2 40%, #1e5fd8 100%)' }}>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Top glow */}
        <div className="absolute top-0 right-0 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)', transform: 'translate(20%, -30%)' }} />
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(30,95,216,0.6) 0%, transparent 70%)', transform: 'translate(-20%, 25%)' }} />

        <div className="relative z-10 flex flex-col h-full p-11">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TrueHire</span>
          </div>

          {/* Headline */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 w-fit"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white/80 text-xs font-semibold tracking-wide">Identity Verification Platform</span>
            </div>
            <h2 className="text-[38px] font-extrabold text-white leading-tight tracking-tight mb-3">
              Verified Talent.<br />
              <span style={{ color: '#bfdbfe' }}>Zero Doubt.</span>
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed max-w-sm">
              Prove the person you interview is the real, verified person — at submission, at the interview, and at offer.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex gap-2.5 mb-8 flex-wrap">
            {pillars.map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: p.bg, color: p.color }}>
                  {p.icon}
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-none">{p.label}</p>
                  <p className="text-white/50 text-[10px] mt-0.5 leading-none">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How recruiters use it */}
          <div className="mb-8">
            <p className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-4">How recruiters use TrueHire</p>
            <div className="space-y-0">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Spine line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-[15px] top-7 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  )}
                  <div className="flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold mt-0.5 z-10"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>
                    {s.n}
                  </div>
                  <div className="pb-5">
                    <p className="text-white text-sm font-semibold leading-snug">{s.title}</p>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock verification card */}
          <div className="rounded-2xl p-4 mb-2"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.25)' }}>SC</div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">Sarah Chen</p>
                  <p className="text-white/40 text-xs mt-0.5">Senior DevOps Engineer</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>✓ PASS</span>
            </div>

            <div className="flex gap-1.5 mb-3">
              {[
                { label: 'C1', hint: 'ID + Liveness' },
                { label: 'C2', hint: 'Interview' },
                { label: 'C3', hint: 'Offer' },
              ].map(c => (
                <div key={c.label} className="flex-1 rounded-lg py-1.5 text-center"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <p className="text-[10px] font-bold" style={{ color: '#34d399' }}>✓ {c.label}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{c.hint}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Liveness', value: '98%', color: '#34d399' },
                { label: 'Face match', value: '96%', color: '#34d399' },
                { label: 'AML hits', value: '0', color: '#34d399' },
              ].map((m, i) => (
                <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] text-white/35">{m.label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg px-3 py-2 flex items-center gap-2"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-[11px]" style={{ color: '#34d399' }}>Identity verified · Compliance PDF ready</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6">
            <p className="text-white/25 text-xs">© 2026 TrueHire · Verified hiring for a remote-first world</p>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────── */}
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
            {/* Heading */}
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
