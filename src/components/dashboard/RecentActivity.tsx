import type { AuditEntry } from '@/lib/types'

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  candidate_created:   { label: 'Candidate added',             icon: '➕', color: 'bg-blue-50 text-blue-600' },
  candidate_updated:   { label: 'Candidate updated',           icon: '✏️', color: 'bg-gray-50 text-gray-600' },
  candidate_deleted:   { label: 'Candidate removed',           icon: '🗑️', color: 'bg-red-50 text-red-500' },
  C2_initiated:        { label: 'Interview check triggered',   icon: '🎥', color: 'bg-amber-50 text-amber-600' },
  C3_initiated:        { label: 'Offer check triggered',       icon: '✍️', color: 'bg-emerald-50 text-emerald-600' },
  c1_session_refreshed:{ label: 'Verification link refreshed', icon: '🔄', color: 'bg-purple-50 text-purple-600' },
  consent_given:       { label: 'Candidate consent recorded',  icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  entries: AuditEntry[]
  candidateNames: Record<string, string>
}

export default function RecentActivity({ entries, candidateNames }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">Recent Activity</h3>
        <p className="text-xs text-gray-400 mb-6">Actions across your workspace</p>
        <div className="text-center py-8">
          <span className="text-3xl">📋</span>
          <p className="text-sm text-gray-400 mt-2">No activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Recent Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Last {entries.length} actions across your workspace</p>
        </div>
      </div>

      <div className="space-y-1">
        {entries.map((entry, i) => {
          const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, icon: '📌', color: 'bg-gray-50 text-gray-500' }
          const candidateName = entry.candidate_id ? candidateNames[entry.candidate_id] : null

          return (
            <div key={entry.id} className={`flex items-start gap-3 py-3 ${i < entries.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm ${meta.color}`}>
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                {candidateName && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{candidateName}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{timeAgo(entry.created_at)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
