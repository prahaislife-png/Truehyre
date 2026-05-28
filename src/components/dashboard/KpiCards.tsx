interface Props {
  total: number
  passed: number
  failed: number
  action: number
}

function KpiCard({
  label, value, sub, icon, accent,
}: {
  label: string; value: number; sub: string; icon: string
  accent: { num: string; bg: string; border: string; iconBg: string }
}) {
  return (
    <div className={`bg-white rounded-2xl border ${accent.border} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${accent.iconBg}`}>
          {icon}
        </span>
      </div>
      <p className={`text-4xl font-black ${accent.num}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

export default function KpiCards({ total, passed, failed, action }: Props) {
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
  const failRate = total > 0 ? Math.round((failed / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KpiCard
        label="Total candidates"
        value={total}
        sub="all time"
        icon="👥"
        accent={{ num: 'text-gray-900', bg: '', border: 'border-gray-100', iconBg: 'bg-gray-50' }}
      />
      <KpiCard
        label="Passed"
        value={passed}
        sub={`${passRate}% pass rate`}
        icon="✅"
        accent={{ num: 'text-emerald-600', bg: '', border: 'border-emerald-100', iconBg: 'bg-emerald-50' }}
      />
      <KpiCard
        label="Failed"
        value={failed}
        sub={`${failRate}% fail rate`}
        icon="⚠️"
        accent={{ num: 'text-red-500', bg: '', border: action === 0 && failed > 0 ? 'border-red-100' : 'border-gray-100', iconBg: 'bg-red-50' }}
      />
      <KpiCard
        label="Need action"
        value={action}
        sub="awaiting verification"
        icon="⏳"
        accent={{
          num: action > 0 ? 'text-blue-600' : 'text-gray-900',
          bg: '',
          border: action > 0 ? 'border-blue-200' : 'border-gray-100',
          iconBg: action > 0 ? 'bg-blue-50' : 'bg-gray-50',
        }}
      />
    </div>
  )
}
