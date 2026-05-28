'use client'

import { useState } from 'react'

const SALARY_OPTIONS = [
  { label: '< $30k / year', multiplier: 30000 },
  { label: '$30k – $60k', multiplier: 45000 },
  { label: '$60k – $100k', multiplier: 80000 },
  { label: '$100k – $150k', multiplier: 125000 },
  { label: '$150k+', multiplier: 175000 },
]

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

export default function RoiCalculator() {
  const [hires, setHires] = useState(20)
  const [salaryIdx, setSalaryIdx] = useState(2)

  const annual = hires * 12
  const fraudHires = Math.round(annual * 0.1)
  const salary = SALARY_OPTIONS[salaryIdx].multiplier
  const riskExposure = fraudHires * salary * 3

  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
          ROI Calculator
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
          How much does one fraudulent hire cost you?
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-12 text-base">
          Move the sliders. See your real exposure — then see what TrueHire costs to prevent it.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          {/* Monthly hires slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-700">Monthly hires</label>
              <span className="text-blue-600 font-black text-lg">{hires}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={hires}
              onChange={e => setHires(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span><span>100</span>
            </div>
          </div>

          {/* Salary selector */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Average salary range
            </label>
            <div className="flex flex-wrap gap-2">
              {SALARY_OPTIONS.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => setSalaryIdx(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    salaryIdx === i
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Results */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-2xl font-black text-gray-900">{annual}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">Annual hires</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5">
              <p className="text-2xl font-black text-amber-600">~{fraudHires}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">Estimated fraud risk hires<br/>(industry avg 10%)</p>
            </div>
            <div className="bg-red-50 rounded-xl p-5">
              <p className="text-2xl font-black text-red-600">{fmt(riskExposure)}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">Annual risk exposure<br/>(3× salary cost)</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Based on industry estimates: ~10% fraud rate among candidates; bad hire total cost ≈ 3× first-year salary (recruiting, training, productivity, legal).
          </p>

          <div className="text-center">
            <a
              href="#pricing"
              className="inline-block px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
            >
              See how affordable TrueHire is →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
