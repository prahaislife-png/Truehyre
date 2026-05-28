const DIDIT_BASE = 'https://verification.didit.me'

function jsonHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.DIDIT_API_KEY!,
  }
}

function apiKey() {
  return process.env.DIDIT_API_KEY!
}

export async function createSession(payload: {
  workflow_id: string
  vendor_data: string
  callback: string
}) {
  const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
    method: 'POST',
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Didit generatePdf ${res.status}: ${err}`)
  }
  return res
}

export interface FaceMatchResult {
  request_id: string
  face_match: {
    status: string
    score: number
    warnings: string[]
  }
}

export interface FaceSearchResult {
  request_id: string
  face_search: {
    status: string
    total_matches: number
    matches: Array<{
      session_id: string
      similarity_percentage: number
      vendor_data: string
      verification_date: string
      status: string
      is_blocklisted: boolean
    }>
    warnings: string[]
  }
}

// Fetch an image from any URL (including Didit-hosted images) as a Buffer
export async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { 'x-api-key': apiKey() } })
  if (!res.ok) throw new Error(`fetchImage ${res.status}: ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

// Build a multipart/form-data body from a plain object of fields
// Fields with Buffer values are attached as image/jpeg files
function buildFormData(fields: Record<string, string | Buffer>): { body: FormData } {
  const form = new FormData()
  for (const [key, val] of Object.entries(fields)) {
    if (Buffer.isBuffer(val)) {
      form.append(key, new Blob([new Uint8Array(val)], { type: 'image/jpeg' }), `${key}.jpg`)
    } else {
      form.append(key, val)
    }
  }
  return { body: form }
}

export async function faceMatch(
  userImageBuffer: Buffer,
  refImageBuffer: Buffer,
  vendorData?: string
): Promise<FaceMatchResult> {
  const { body } = buildFormData({
    user_image: userImageBuffer,
    ref_image: refImageBuffer,
    ...(vendorData ? { vendor_data: vendorData } : {}),
  })

  const res = await fetch(`${DIDIT_BASE}/v3/face-match/`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey() },
    body,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Didit faceMatch ${res.status}: ${err}`)
  }
  return res.json() as Promise<FaceMatchResult>
}

export async function faceSearch(
  userImageBuffer: Buffer,
  vendorData: string
): Promise<FaceSearchResult> {
  const { body } = buildFormData({
    user_image: userImageBuffer,
    vendor_data: vendorData,
    save_api_request: 'true',
  })

  const res = await fetch(`${DIDIT_BASE}/v3/face-search/`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey() },
    body,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Didit faceSearch ${res.status}: ${err}`)
  }
  return res.json() as Promise<FaceSearchResult>
}

// Extract the best selfie image URL from a Didit session decision.
// Tries multiple known field locations; returns null if none found.
export function extractSelfieUrl(decision: Record<string, unknown>): string | null {
  // liveness_checks may carry an image URL
  const liveness = (decision.liveness_checks as Array<Record<string, unknown>> | undefined)?.[0]
  if (liveness?.image_url) return liveness.image_url as string
  if (liveness?.selfie_url) return liveness.selfie_url as string

  // face_matches images object — prefer user_image (selfie) over ref_image (document)
  const fm = (decision.face_matches as Array<Record<string, unknown>> | undefined)?.[0]
  const images = fm?.images as Record<string, string> | undefined
  if (images) {
    for (const key of ['user_image', 'selfie', 'live_image', 'capture']) {
      if (images[key]) return images[key]
    }
    // Fallback: first URL-like value
    const first = Object.values(images).find(v => typeof v === 'string' && v.startsWith('http'))
    if (first) return first
  }

  return null
}
