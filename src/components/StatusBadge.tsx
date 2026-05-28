import type { CandidateStatus } from '@/lib/types'

const config: Record<CandidateStatus, { label: string; className: string }> = {
  approved:     { label: 'Pass',      className: 'bg-green-100 text-green-800' },
  declined:     { label: 'Fail',      className: 'bg-red-100 text-red-800' },
  in_review:    { label: 'Review',    className: 'bg-yellow-100 text-yellow-800' },
  pending:      { label: 'Pending',   className: 'bg-gray-100 text-gray-600' },
  not_started:  { label: 'Not Started', className: 'bg-gray-100 text-gray-500' },
  in_progress:  { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  awaiting_user:{ label: 'Awaiting User', className: 'bg-indigo-100 text-indigo-700' },
  resubmitted:  { label: 'Resubmitted', className: 'bg-purple-100 text-purple-700' },
  abandoned:    { label: 'Abandoned', className: 'bg-gray-100 text-gray-500' },
  expired:      { label: 'Expired',   className: 'bg-orange-100 text-orange-700' },
  kyc_expired:  { label: 'KYC Expired', className: 'bg-orange-100 text-orange-700' },
}

export default function StatusBadge({ status }: { status: CandidateStatus }) {
  const { label, className } = config[status] ?? config.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
