'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TERMINAL = ['approved', 'declined', 'abandoned', 'expired', 'kyc_expired']

export default function CandidateRefresher({ status }: { status: string }) {
  const router = useRouter()

  useEffect(() => {
    if (TERMINAL.includes(status)) return
    const interval = setInterval(() => router.refresh(), 10000)
    return () => clearInterval(interval)
  }, [status, router])

  return null
}
