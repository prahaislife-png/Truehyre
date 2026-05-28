'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  candidateId: string
  poaEnabled: boolean
  dbEnabled: boolean
  c1Status: string | null
}

function OptionToggle({
  label,
  description,
  checked,
  locked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  locked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className={`flex items-start gap-3 ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={e => !locked && onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${locked ? '' : 'hover:opacity-90'}`}
          onClick={() => !locked && onChange(!checked)}
        >
          <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mt-0.75 mx-0.75 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
            style={{ margin: '3px', transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
          />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </label>
  )
}

export default function CandidateVerificationOptions({ candidateId, poaEnabled, dbEnabled, c1Status }: Props) {
  const [poa, setPoa] = useState(poaEnabled)
  const [db, setDb] = useState(dbEnabled)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Locked once C1 is past not_started
  const isLocked = !!c1Status && c1Status !== 'not_started'

  async function updateFlag(field: 'proof_of_address_enabled' | 'database_validation_enabled', value: boolean) {
    if (isLocked) return
    if (field === 'proof_of_address_enabled') setPoa(value)
    else setDb(value)

    setSaving(true)
    await fetch(`/api/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="border-t border-gray-100 pt-5 mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">C1 Verification Options</p>
        {isLocked && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Locked — C1 in progress
          </span>
        )}
        {saving && <span className="text-xs text-blue-500">Saving…</span>}
      </div>
      <div className="space-y-3">
        <OptionToggle
          label="Proof of Address"
          description="Candidate submits a utility bill or bank statement to verify their address"
          checked={poa}
          locked={isLocked}
          onChange={v => updateFlag('proof_of_address_enabled', v)}
        />
        <OptionToggle
          label="Database Validation"
          description="Validates the ID number against official government records (340+ countries)"
          checked={db}
          locked={isLocked}
          onChange={v => updateFlag('database_validation_enabled', v)}
        />
      </div>
      {!isLocked && (poa || db) && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
          These options require a matching Didit workflow. Set <code className="font-mono">DIDIT_WORKFLOW_C1_POA</code>, <code className="font-mono">DIDIT_WORKFLOW_C1_DB</code>, or <code className="font-mono">DIDIT_WORKFLOW_C1_POA_DB</code> env vars as needed.
        </p>
      )}
    </div>
  )
}
