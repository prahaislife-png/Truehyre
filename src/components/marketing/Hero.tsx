import Link from 'next/link'

const TRUST_STATS = ['220+ countries', '~2 min per check', '3-stage protection', 'No app required']

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d1b2a]">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96,165,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-32 pb-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">
            Identity Verification for Modern Hiring
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.0] tracking-tight mb-6">
          Verified Talent.
          <br />
          <span className="text-blue-400">Zero Doubt.</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
          The only hiring platform that confirms the same real, government-verified person shows up at
          application, interview, and offer — in 2 minutes, with no app required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-base shadow-lg shadow-blue-900/30"
          >
            Get started
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium rounded-xl transition-colors text-base"
          >
            See how it works ↓
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_STATS.map(stat => (
            <span key={stat} className="flex items-center gap-2 text-sm text-white/35">
              <span className="w-1 h-1 rounded-full bg-blue-400/50" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
