import { getResend, FROM } from './resend'

export async function sendVerificationLink({
  to,
  candidateName,
  verificationUrl,
  orgName,
  subject,
}: {
  to: string
  candidateName: string
  verificationUrl: string
  orgName: string
  subject?: string
}) {
  const emailSubject = subject ?? `Action required: Complete your identity verification for ${orgName}`
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: emailSubject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111827">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 4px">TrueHire</h1>
        <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Identity verification request</p>

        <p style="font-size:15px;margin:0 0 8px">Hi <strong>${candidateName}</strong>,</p>
        <p style="font-size:14px;color:#374151;margin:0 0 24px">
          <strong>${orgName}</strong> has asked you to complete a quick identity verification
          as part of your application process.
        </p>

        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0369a1">What to expect</p>
          <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#374151;line-height:1.8">
            <li>Takes about 2 minutes on your phone</li>
            <li>You'll need a valid photo ID (passport or national ID)</li>
            <li>No app needed — works in your browser</li>
          </ul>
        </div>

        <a href="${verificationUrl}"
          style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          Start verification →
        </a>

        <p style="margin-top:24px;font-size:12px;color:#9ca3af">
          This link is unique to you. Do not share it with anyone else.
          If you did not expect this email, you can safely ignore it.
        </p>
      </div>
    `,
    text: `Hi ${candidateName},\n\n${orgName} has asked you to complete an identity verification as part of your application.\n\nStart here: ${verificationUrl}\n\nTakes ~2 minutes on your phone. No app needed.\n\nIf you did not expect this email, you can safely ignore it.`,
  })
  if (error) {
    console.error('sendVerificationLink failed:', JSON.stringify(error))
  }
}
