const STEPS = [
  {
    icon: '📋',
    step: 'Step 1',
    title: 'Application (C1)',
    timing: 'Day 0',
    desc: 'Candidate submits application. TrueHire instantly sends a government-ID verification link. Identity confirmed in under 2 minutes — no app, no download.',
  },
  {
    icon: '🎥',
    step: 'Step 2',
    title: 'Interview (C2)',
    timing: 'Interview day',
    desc: 'Before the video call starts, TrueHire sends a fresh liveness check. The same verified face must match — eliminating proxy interview fraud entirely.',
    highlight: true,
  },
  {
    icon: '✍️',
    step: 'Step 3',
    title: 'Offer Acceptance (C3)',
    timing: 'Offer stage',
    desc: 'At offer sign, TrueHire runs a final re-verification. You know the person accepting the offer is exactly who you vetted throughout the process.',
  },
  {
    icon: '✅',
    step: 'Always',
    title: 'Verified on Record',
    timing: 'Permanent',
    desc: 'Every checkpoint is logged with timestamp and match score. Full audit trail — ready for compliance, legal, or HR review at any time.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          How It Works
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          One verified person, every step
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-base">
          TrueHire links the candidate's verified identity to all three hiring touchpoints — not just one.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {STEPS.map(({ icon, step, title, timing, desc, highlight }) => (
            <div
              key={step}
              className={`rounded-2xl p-6 border flex flex-col gap-3 ${
                highlight
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    highlight
                      ? 'bg-blue-500/40 text-blue-100'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {timing}
                </span>
              </div>
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                  {step}
                </p>
                <p className={`font-black text-base ${highlight ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </p>
              </div>
              <p className={`text-sm leading-relaxed ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-8 py-5 flex items-start gap-4">
          <span className="text-2xl mt-0.5">💡</span>
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>The interview checkpoint (C2) is where most fraud happens</strong> — and where TrueHire
            is uniquely effective. It's the only platform that binds a liveness check to the
            moment before a video interview begins.
          </p>
        </div>
      </div>
    </section>
  )
}
