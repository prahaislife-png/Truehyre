import { Resend } from 'resend'

export const FROM = 'TrueHire <noreply@truehirehq.com>'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
  }
  return _resend
}
