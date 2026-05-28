import { getResend, FROM } from './resend'

const STATUS_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  approved:  { emoji: '✅', label: 'Approved',  color: '#166534', bg: '#f0fdf4' },
  declined:  { emoji: '❌', label: 'Declined',  color: '#991b1b', bg: '#fef2f2' },
  in_review: { emoji: '⏳', label: 'In Review', color: '#92400e', bg: '#fffbeb' },
}

const CHECKPOINT_LABEL: Record<string, string> = {
  C1: 'Identity Verification',
  C2: 'Interview Check',
  C3: 'Offer Check',
}

export async function sendVerificationResult({
  to,
  candidateName,
  status,
  checkpoint,
  profileUrl,
}: {
  to: string
  candidateName: string
  status: string
  checkpoint: string | null
  profileUrl: string
}) {
  const cfg = STATUS_CONFIG[status] ?? { emoji: 'ℹ️', label: status, color: '#374151', bg: '#f9fafb' }
  const checkpointLabel = checkpoint ? (CHECKPOINT_LABEL[checkpoint] ?? checkpoint) : 'Verification'

  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `${cfg.emoji} ${candidateName} — ${checkpointLabel} ${cfg.label}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111827">
          <h1 style="font-size:20px;font-weight:700;margin:0 0 4px">TrueHire</h1>
          <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Verification notification</p>

          <div style="background:${cfg.bg};border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:${cfg.color}">
              ${cfg.emoji} ${checkpointLabel}: ${cfg.label}
            </p>
            <p style="margin:0;color:#374151;font-size:14px">
              Candidate: <strong>${candidateName}</strong>
            </p>
          </div>

          <a href="${profileUrl}"
            style="display:inline-block;background:#3b82f6;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
            View candidate profile →
          </a>

          <p style="margin-top:32px;font-size:12px;color:#9ca3af">
            This is an automated message from TrueHire. Do not reply to this email.
          </p>
        </div>
      `,
      text: `${cfg.emoji} ${candidateName} — ${checkpointLabel}: ${cfg.label}\n\nView profile: ${profileUrl}`,
    })
  } catch (err) {
    console.error('sendVerificationResult failed:', err)
  }
}
