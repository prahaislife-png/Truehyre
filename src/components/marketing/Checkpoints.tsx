const CHECKPOINTS = [
  {
    id: 'C1',
    name: 'Application',
    tagline: 'Confirm identity before wasting a single interview slot',
    icon: '🪪',
    color: 'blue',
    when: 'At application submission',
    what: [
      'Government ID document scan + liveness selfie',
      'Face match: ID photo vs. live selfie',
      'Verified in under 2 minutes',
      'No app or download required',
    ],
    badge: null,
  },
  {
    id: 'C2',
    name: 'Interview',
    tagline: 'The check no one else does — and where fraud actually happens',
    icon: '🎥',
    color: 'amber',
    when: 'Before the video interview begins',
    what: [
      'Fresh liveness check, cross-matched to C1 face',
      'Ensures the interviewee is the same verified applicant',
      'Works with Zoom, Meet, or any platform',
      'Results in seconds, logged with timestamp',
    ],
    badge: 'KEY',
  },
  {
    id: 'C3',
    name: 'Offer',
    tagline: 'Lock in a clean audit trail before the contract is signed',
    icon: '📝',
    color: 'green',
    when: 'At offer acceptance',
    what: [
      'Final re-verification against C1 + C2 records',
      'Confirms continuity of identity across the process',
      'Permanent timestamped audit record',
      'Optional AML / sanctions screen add-on',
    ],
    badge: null,
  },
]

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    idBg: 'bg-blue-600',
    dot: 'bg-blue-500',
    tag: 'bg-blue-100 text-blue-700',
    bullet: 'text-blue-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    idBg: 'bg-amber-500',
    dot: 'bg-amber-400',
    tag: 'bg-amber-100 text-amber-700',
    bullet: 'text-amber-500',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    idBg: 'bg-emerald-600',
    dot: 'bg-emerald-500',
    tag: 'bg-emerald-100 text-emerald-700',
    bullet: 'text-emerald-500',
  },
}

export default function Checkpoints() {
  return (
    <section id="features" className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          3-Checkpoint Protection
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          Identity verified at every gate
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-base">
          Each checkpoint is independent, timestamped, and cross-matched — giving you an unbroken chain of proof.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {CHECKPOINTS.map(({ id, name, tagline, icon, color, when, what, badge }) => {
            const c = colorMap[color as keyof typeof colorMap]
            return (
              <div
                key={id}
                className={`rounded-2xl border-2 ${c.border} ${c.bg} p-7 flex flex-col gap-5 relative`}
              >
                {badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase">
                    {badge}
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.idBg} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-black tracking-widest text-gray-400 uppercase">{id}</p>
                    <p className="font-black text-xl text-gray-900">{name}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed font-medium">{tagline}</p>

                <div>
                  <p className={`text-xs font-bold mb-3 ${c.tag.split(' ')[1]} inline-block px-2.5 py-1 rounded-full ${c.tag}`}>
                    {when}
                  </p>
                  <ul className="space-y-2">
                    {what.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className={`${c.bullet} mt-0.5 flex-shrink-0`}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
