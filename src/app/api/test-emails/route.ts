import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationLink } from '@/lib/email/sendVerificationLink'
import { sendVerificationResult } from '@/lib/email/sendVerificationResult'
import { sendInvite } from '@/lib/email/sendInvite'

// One-shot test endpoint — remove after testing
export async function POST(request: NextRequest) {
  const { to } = await request.json() as { to: string }
  if (!to) return NextResponse.json({ error: 'to is required' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const results: Record<string, string> = {}

  try {
    await sendVerificationLink({
      to,
      candidateName: 'Govind Amilkanthwar',
      verificationUrl: `${appUrl}/verify/complete`,
      orgName: 'ThoughtsON Technologies',
    })
    results.verificationLink = 'sent'
  } catch (err) {
    results.verificationLink = String(err)
  }

  try {
    await sendVerificationResult({
      to,
      candidateName: 'Govind Amilkanthwar',
      status: 'approved',
      checkpoint: 'C1',
      profileUrl: `${appUrl}/dashboard`,
    })
    results.verificationResult = 'sent'
  } catch (err) {
    results.verificationResult = String(err)
  }

  try {
    await sendInvite({
      to,
      orgName: 'ThoughtsON Technologies',
      invitedByEmail: 'admin@truehirehq.com',
      inviteUrl: `${appUrl}/invite/test-token`,
      role: 'recruiter',
    })
    results.teamInvite = 'sent'
  } catch (err) {
    results.teamInvite = String(err)
  }

  return NextResponse.json({ results })
}
