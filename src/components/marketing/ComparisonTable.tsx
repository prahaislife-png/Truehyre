const ROWS = [
  { feature: 'Identity verified before interview', truehire: 'yes', bgv: 'no', linkedin: 'partial', manual: 'no' },
  { feature: 'Liveness check (live face match)', truehire: 'yes', bgv: 'no', linkedin: 'no', manual: 'no' },
  { feature: 'Works without candidate app', truehire: 'yes', bgv: 'partial', linkedin: 'no', manual: 'yes' },
  { feature: 'Results in under 2 minutes', truehire: 'yes', bgv: 'no', linkedin: 'partial', manual: 'no' },
  { feature: 'Covers 220+ countries', truehire: 'yes', bgv: 'partial', linkedin: 'no', manual: 'partial' },
  { feature: 'Fraud-proof audit trail', truehire: 'yes', bgv: 'partial', linkedin: 'no', manual: 'no' },
  { feature: 'AML / sanctions screening', truehire: 'addon', bgv: 'yes', linkedin: 'no', manual: 'no' },
  { feature: 'Integrates with your ATS', truehire: 'yes', bgv: 'yes', linkedin: 'partial', manual: 'no' },
]

type CellValue = 'yes' | 'no' | 'partial' | 'addon'

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  const base = 'flex items-center justify-center py-4 px-3'
  if (value === 'yes') return <div className={`${base} ${highlight ? 'text-blue-600' : 'text-emerald-600'} font-bold text-base`}>✓</div>
  if (value === 'no') return <div className={`${base} text-gray-300 text-base`}>✗</div>
  if (value === 'partial') return <div className={`${base} text-amber-500 text-xs font-semibold`}>Partial</div>
  if (value === 'addon') return <div className={`${base} text-blue-400 text-xs font-semibold`}>Add-on</div>
  return null
}

export default function ComparisonTable() {
  const columns = [
    { key: 'truehire', label: 'TrueHire', highlight: true },
    { key: 'bgv', label: 'Traditional BGV' },
    { key: 'linkedin', label: 'LinkedIn Verify' },
    { key: 'manual', label: 'Manual Check' },
  ]

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          Comparison
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          Not all verification is equal
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-12 text-base">
          Most tools verify documents. TrueHire verifies the person — at every stage of your hiring funnel.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 w-[40%]">
                  Capability
                </th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`py-4 px-3 text-center text-sm font-black ${
                      col.highlight
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                  >
                    {col.highlight && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 align-middle mb-0.5" />
                    )}
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.feature} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  <td className="py-3 px-6 text-sm text-gray-700 font-medium">{row.feature}</td>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`text-center ${col.highlight ? 'bg-blue-50/60' : ''}`}
                    >
                      <Cell value={row[col.key as keyof typeof row] as CellValue} highlight={col.highlight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          ✓ = Full support &nbsp;·&nbsp; Partial = Limited or requires extra steps &nbsp;·&nbsp; ✗ = Not supported
        </p>
      </div>
    </section>
  )
}
