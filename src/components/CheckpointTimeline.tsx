import type { Verification, CandidateStatus } from '@/lib/types'
import StatusBadge from './StatusBadge'

function recheckVerdict(v: Verification): { label: string; className: string } | null {
  if (!v.face_match_score && !v.duplicate_face_flag) return null
  if (v.duplicate_face_flag) {
    return { label: 'DUPLICATE FACE', className: 'bg-red-100 text-red-800 border border-red-300' }
  }
  if (v.status === 'approved') {
    return { label: 'MATCH', className: 'bg-green-100 text-green-800 border border-green-300' }
  }
  return { label: 'NO MATCH', className: 'bg-red-100 text-red-800 border border-red-300' }
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'text-green-700' : value >= 50 ? 'text-yellow-700' : 'text-red-600'
  return (
    <div className="text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}%</p>
    </div>
  )
}

function CheckpointNode({
  label,
  sublabel,
  verification,
  isLast,
}: {
  label: string
  sublabel: string
  verification: Verification | null
  isLast: boolean
}) {
  const status = (verification?.status ?? 'not_started') as CandidateStatus
  const isActive = !!verification

  const dotColor =
    status === 'approved' ? 'bg-green-500' :
    status === 'declined' ? 'bg-red-500' :
    isActive ? 'bg-blue-400' :
    'bg-gray-300'

  const verdict = verification && (verification.checkpoint === 'C2' || verification.checkpoint === 'C3')
    ? recheckVerdict(verification)
    : null

  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>

      {/* Card */}
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        <div className={`rounded-xl border p-4 ${isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-200'}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{sublabel}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {verification && (
            <div className="mt-3 space-y-2">
              {/* Recheck verdict banner */}
              {verdict && (
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${verdict.className}`}>
                  {verdict.label === 'DUPLICATE FACE' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {verdict.label}
                </div>
              )}

              {/* Scores row */}
              <div className="flex gap-4">
                {verification.liveness_score != null && (
                  <ScoreChip label="Liveness" value={
                    verification.liveness_score > 1
                      ? Math.round(verification.liveness_score)
                      : Math.round(verification.liveness_score * 100)
                  } />
                )}
                {verification.face_match_score != null && (
                  <ScoreChip label="Face match" value={Math.round(verification.face_match_score * 100)} />
                )}
              </div>

              {/* Duplicate reference */}
              {verification.duplicate_candidate_id && (
                <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                  Matched candidate ID: {verification.duplicate_candidate_id}
                </p>
              )}

              {/* Timestamp */}
              {verification.completed_at && (
                <p className="text-xs text-gray-400">
                  Completed {new Date(verification.completed_at).toLocaleString()}
                </p>
              )}
              {!verification.completed_at && (
                <p className="text-xs text-gray-400">
                  Started {new Date(verification.created_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {!verification && (
            <p className="mt-2 text-xs text-gray-400 italic">Not yet initiated</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckpointTimeline({
  c1,
  c2,
  c3,
}: {
  c1: Verification | null
  c2: Verification | null
  c3: Verification | null
}) {
  return (
    <div>
      <CheckpointNode
        label="C1 — Identity Verification"
        sublabel="Baseline ID + liveness + face enrolment"
        verification={c1}
        isLast={false}
      />
      <CheckpointNode
        label="C2 — Interview Check"
        sublabel="Liveness re-check + face match vs C1"
        verification={c2}
        isLast={false}
      />
      <CheckpointNode
        label="C3 — Offer Check"
        sublabel="Final liveness re-check + face match vs C1"
        verification={c3}
        isLast={true}
      />
    </div>
  )
}
