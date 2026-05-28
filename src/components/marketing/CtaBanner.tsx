import Link from 'next/link'

export default function CtaBanner() {
  return (
    <section className="bg-[#0d1b2a] py-24 px-6 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96,165,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-5">
          Ready when you are
        </p>
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
          Start protecting your hires.
          <br />
          <span className="text-blue-400">Zero commitment required.</span>
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Get your first 3 candidates verified free. No card, no contract — just proof that it works.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-blue-900/40"
          >
            Get started free
          </Link>
          <a
            href="mailto:hello@truehire.app"
            className="w-full sm:w-auto px-8 py-4 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium rounded-xl transition-colors text-base"
          >
            Talk to sales →
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
          {['No credit card', 'Setup in 5 minutes', 'Cancel anytime'].map(tag => (
            <span key={tag} className="flex items-center gap-2 text-sm text-white/30">
              <span className="w-1 h-1 rounded-full bg-blue-500/60" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
