const DIDIT_BASE = 'https://verification.didit.me'

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.DIDIT_API_KEY!,
  }
}

export async function createSession(payload: {
  workflow_id: string
  vendor_data: string
  callback: string
}) {
  const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Didit createSession ${res.status}: ${err}`)
  }
  return res.json() as Promise<{ session_id: string; url: string }>
}

export async function getDecision(sessionId: string) {
  const res = await fetch(`${DIDIT_BASE}/v3/session/${sessionId}/decision/`, {
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Didit getDecision ${res.status}: ${err}`)
  }
  return res.json()
}

export async function generatePdf(sessionId: string): Promise<Response> {
  const res = await fetch(`${DIDIT_BASE}/v3/session/${sessionId}/pdf`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Didit generatePdf ${res.status}: ${err}`)
  }
  return res
}
