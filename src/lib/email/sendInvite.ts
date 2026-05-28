import { getResend, FROM } from './resend'

export async function sendInvite({
  to,
  orgName,
  invitedByEmail,
  inviteUrl,
  role,
}: {
  to: string
  orgName: string
  invitedByEmail: string
  inviteUrl: string
  role: string
}) {
  const roleLabel = role === 'admin' ? 'Admin' : role === 'client_viewer' ? 'Client Viewer' : 'Recruiter'

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `You've been invited to join ${orgName} on TrueHire`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111827">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 4px">TrueHire</h1>
        <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Team invitation</p>

        <p style="font-size:15px;margin:0 0 8px">
          <strong>${invitedByEmail}</strong> has invited you to join
          <strong>${orgName}</strong> on TrueHire as <strong>${roleLabel}</strong>.
        </p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 28px">
          TrueHire is a hiring verification platform that checks candidate identities across the hiring process.
        </p>

        <a href="${inviteUrl}"
          style="display:inline-block;background:#3b82f6;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          Accept invitation →
        </a>

        <p style="margin-top:24px;font-size:12px;color:#9ca3af">
          This invitation expires in 7 days. If you didn't expect this email, you can ignore it.
        </p>
      </div>
    `,
    text: `${invitedByEmail} has invited you to join ${orgName} on TrueHire as ${roleLabel}.\n\nAccept here: ${inviteUrl}\n\nThis invitation expires in 7 days.`,
  })
  if (error) {
    console.error('sendInvite failed:', error)
  }
}
