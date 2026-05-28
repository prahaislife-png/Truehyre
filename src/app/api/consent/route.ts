import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const { candidateId } = body as Record<string, unknown>
  if (typeof candidateId !== 'string' || !UUID_RE.test(candidateId)) {
    return NextResponse.json({ error: 'invalid candidateId' }, { status: 400 })
  }

  await logAudit('consent_given', {
    candidateId,
    meta: {
      user_agent: request.headers.get('user-agent') ?? '',
      timestamp: new Date().toISOString(),
    },
  })

  return NextResponse.json({ ok: true })
}
