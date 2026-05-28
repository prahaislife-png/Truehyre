const STATS = [
  {
    value: '1 in 4',
    label: 'Candidates misrepresent credentials',
    sub: 'education, experience, or identity',
  },
  {
    value: '70 min',
    label: 'Average screening time per candidate',
    sub: 'before a single document is verified',
  },
  {
    value: '~60%',
    label: 'Offer-stage fraud goes undetected',
    sub: 'traditional BGV misses interview swap',
  },
  {
    value: '3–5×',
    label: 'Cost of a bad hire vs. salary',
    sub: 'recruiting, training, and productivity loss',
  },
]

export default function ProblemStats() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          The Hiring Fraud Problem
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          Identity fraud is hiding in plain sight
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-base">
          Most teams don't realise they've hired an impostor until months later — by then the damage is done.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STATS.map(({ value, label, sub }) => (
            <div key={value} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
              <p className="text-4xl font-black text-gray-900 mb-2">{value}</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-3xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-red-800 text-base mb-1">
              Traditional background checks don't solve this
            </p>
            <p className="text-red-700/80 text-sm leading-relaxed">
              They verify documents after the hire — but never confirm the person at the interview is
              the same one who applied. A clean background check on a different person is worthless.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
