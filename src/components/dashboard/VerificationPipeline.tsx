interface CheckpointStats {
  total: number
  approved: number
  declined: number
  inProgress: number
}

interface Props {
  c1: CheckpointStats
  c2: CheckpointStats
  c3: CheckpointStats
  totalCandidates: number
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function CheckpointCard({
  id, label, tagline, stats, totalCandidates, color, icon,
}: {
  id: string; label: string; tagline: string; stats: CheckpointStats
  totalCandidates: number; color: { badge: string; bar: string; icon: string; border: string }; icon: string
}) {
  const conversionRate = totalCandidates > 0 ? Math.round((stats.approved / totalCandidates) * 100) : 0

  return (
    <div className={`bg-white rounded-2xl border ${color.border} p-6 flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-black tracking-widest px-2.5 py-1 rounded-full ${color.badge}`}>
            <span className="text-base">{icon}</span>
            {id}
          </span>
          <p className="font-black text-gray-900 text-lg mt-2">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">started</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Approved</span>
          <span className="font-bold text-emerald-600">{stats.approved}</span>
        </div>
        <Bar value={stats.approved} max={stats.total} color="bg-emerald-500" />

        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-gray-500">In progress</span>
          <span className="font-bold text-blue-600">{stats.inProgress}</span>
        </div>
        <Bar value={stats.inProgress} max={stats.total} color="bg-blue-400" />

        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-gray-500">Declined</span>
          <span className="font-bold text-red-500">{stats.declined}</span>
        </div>
        <Bar value={stats.declined} max={stats.total} color="bg-red-400" />
      </div>

      <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Pipeline conversion</span>
        <span className={`font-bold ${conversionRate > 50 ? 'text-emerald-600' : conversionRate > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
          {conversionRate}%
        </span>
      </div>
    </div>
  )
}

export default function VerificationPipeline({ c1, c2, c3, totalCandidates }: Props) {
  const CHECKPOINTS = [
    {
      id: 'C1', label: 'Application', tagline: 'Identity at sign-up', stats: c1, icon: '🪪',
      color: { badge: 'bg-blue-50 text-blue-700', bar: 'bg-blue-400', icon: 'text-blue-600', border: 'border-gray-100' },
    },
    {
      id: 'C2', label: 'Interview', tagline: 'Liveness before the call', stats: c2, icon: '🎥',
      color: { badge: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400', icon: 'text-amber-600', border: 'border-amber-100' },
    },
    {
      id: 'C3', label: 'Offer', tagline: 'Final re-verification', stats: c3, icon: '✍️',
      color: { badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', icon: 'text-emerald-600', border: 'border-gray-100' },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Verification Pipeline</h3>
          <p className="text-xs text-gray-400 mt-0.5">Candidates progressing through each checkpoint</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {CHECKPOINTS.map(cp => (
          <CheckpointCard key={cp.id} {...cp} totalCandidates={totalCandidates} />
        ))}
      </div>
    </div>
  )
}
