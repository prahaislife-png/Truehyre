const PERSONAS = [
  {
    icon: '🏢',
    who: 'Staffing & RPO Agencies',
    pain: 'Clients demand verified pipelines. One fraudulent placement wrecks the contract.',
    gain: 'Send verified-only candidates. Make verification a billable service layer.',
  },
  {
    icon: '💻',
    who: 'Tech & Product Companies',
    pain: 'Remote hiring opens the door to ghost candidates and proxy interview rings.',
    gain: 'Every remote engineer is confirmed live, before they join your Slack.',
  },
  {
    icon: '🌐',
    who: 'Web3 & Crypto Startups',
    pain: 'Anonymous candidates, global teams, high-value access. KYC is table stakes.',
    gain: 'Bind a government identity to every contributor, without slowing velocity.',
  },
  {
    icon: '🏦',
    who: 'BFSI & Regulated Industries',
    pain: "Regulators require hiring audit trails. Manual checks don't scale or hold up.",
    gain: 'Timestamped, tamper-proof verification records for every hire — out of the box.',
  },
  {
    icon: '🚀',
    who: 'Fast-Growing Startups',
    pain: "Scaling fast with no HR team. Can't afford to spend 70 min vetting each CV.",
    gain: 'Automated identity checks that run in the background while you focus on growth.',
  },
]

export default function Personas() {
  return (
    <section id="who-its-for" className="bg-gray-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          Who It&apos;s For
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          Built for teams that can't afford a bad hire
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-base">
          Whether you hire 5 people a month or 500, fraud doesn't discriminate — and neither does TrueHire.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERSONAS.map(({ icon, who, pain, gain }) => (
            <div key={who} className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col gap-4">
              <span className="text-3xl">{icon}</span>
              <h3 className="font-black text-gray-900 text-base">{who}</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-sm mt-0.5 flex-shrink-0">✗</span>
                  <p className="text-sm text-gray-500 leading-relaxed">{pain}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm mt-0.5 flex-shrink-0">✓</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{gain}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Spacer card for symmetry on 3-col grid */}
          <div className="bg-blue-600 rounded-2xl p-7 flex flex-col justify-center gap-4 text-white">
            <p className="font-black text-xl leading-snug">
              Don't see your industry?
            </p>
            <p className="text-blue-100 text-sm leading-relaxed">
              If you hire people and trust matters, TrueHire works for you. We support 220+ countries and every major ID type.
            </p>
            <a
              href="#pricing"
              className="mt-2 inline-block text-sm font-bold text-white underline underline-offset-4 hover:text-blue-200 transition-colors"
            >
              Talk to us →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
