const PLANS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tagline: 'Try it before you commit',
    desc: 'Pre-paid bundle of 20 identity checks — C1 or C3. No subscription. No hidden fees. Perfect for teams running their first verified hiring sprint.',
    checks: ['20 C1 or C3 checks (pre-paid)', 'Government ID + liveness', 'PDF audit report per candidate', 'Browser-based — no app', 'Email support'],
    cta: 'Talk to us',
    highlight: false,
    badge: null,
  },
  {
    id: 'full',
    name: 'Full Protection',
    tagline: 'For teams hiring continuously',
    desc: 'All three checkpoints on every hire. Application → Interview → Offer. The complete anti-fraud chain, delivered as a monthly subscription.',
    checks: ['Unlimited hires (monthly)', 'C1 + C2 + C3 checkpoints', 'Real-time liveness at interview', 'Tamper-proof audit trail', 'Webhook & API access', 'Priority support'],
    cta: 'Talk to us',
    highlight: true,
    badge: 'Most popular',
  },
  {
    id: 'aml',
    name: 'Full Protection + AML',
    tagline: 'For regulated industries',
    desc: 'Everything in Full Protection, plus AML screening, sanctions checks, and PEP (Politically Exposed Person) lookups — all within the same 2-minute flow.',
    checks: ['Everything in Full Protection', 'AML / sanctions screening', 'PEP checks', 'DPDP & GDPR compliance pack', 'Custom data retention policy', 'Dedicated account manager'],
    cta: 'Talk to us',
    highlight: false,
    badge: null,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          Pricing
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          Simple, honest pricing
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-base">
          No public price list — because every team is different. Tell us your hiring volume and we&apos;ll
          give you a number that actually makes sense.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(({ id, name, tagline, desc, checks, cta, highlight, badge }) => (
            <div
              key={id}
              className={`rounded-2xl flex flex-col relative ${
                highlight
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 border-2 border-blue-500'
                  : 'bg-white border border-gray-100'
              }`}
            >
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-black px-4 py-1.5 rounded-full tracking-wider">
                    {badge}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col gap-4 flex-1">
                <div>
                  <p className={`text-xs font-bold tracking-widest uppercase mb-1.5 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                    {tagline}
                  </p>
                  <h3 className={`font-black text-xl ${highlight ? 'text-white' : 'text-gray-900'}`}>
                    {name}
                  </h3>
                </div>

                <p className={`text-sm leading-relaxed ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {desc}
                </p>

                <ul className="space-y-2.5 flex-1">
                  {checks.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span className={`flex-shrink-0 mt-0.5 ${highlight ? 'text-blue-200' : 'text-blue-500'}`}>✓</span>
                      <span className={highlight ? 'text-blue-100' : 'text-gray-600'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <a
                  href="mailto:hello@truehire.app"
                  className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-colors ${
                    highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          All plans include 14-day onboarding support. Volume discounts available for agencies and enterprises.
        </p>
      </div>
    </section>
  )
}
