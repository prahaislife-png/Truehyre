const FEATURES = [
  {
    icon: '⚡',
    title: 'Under 2 Minutes',
    desc: 'From link sent to result confirmed — average 90 seconds. No forms to fill, no portal to navigate.',
  },
  {
    icon: '📱',
    title: 'No App Required',
    desc: 'Candidates verify directly in the browser. Works on any phone, anywhere. Nothing to install.',
  },
  {
    icon: '🌍',
    title: '220+ Countries',
    desc: 'Global ID coverage: passports, national IDs, driving licences. Built for remote-first hiring.',
  },
  {
    icon: '🔒',
    title: 'Tamper-Proof Records',
    desc: 'Every checkpoint is timestamped and stored immutably. Full audit trail from application to onboarding.',
  },
  {
    icon: '🤝',
    title: 'Works With Your Stack',
    desc: 'Integrate via webhook or our API. Works alongside any ATS — Greenhouse, Lever, Workday, or custom.',
  },
  {
    icon: '🛡️',
    title: 'DPDP & GDPR Ready',
    desc: 'Built-in data minimisation, candidate consent flows, and right-to-erasure support out of the box.',
  },
]

export default function Features() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          Platform Features
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          Everything you need. Nothing you don&apos;t.
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-base">
          TrueHire is purpose-built for hiring workflows — not a KYC platform bolted onto a job board.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-2xl border border-gray-100 p-7 flex flex-col gap-3">
              <span className="text-3xl">{icon}</span>
              <h3 className="font-black text-gray-900 text-base">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
