import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const ALLOWED_HOSTS = ['verification.didit.me', 'api.didit.me', 'cdn.didit.me']

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url')
  if (!raw) return new NextResponse('Missing url', { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const res = await fetch(raw, { headers: { 'x-api-key': process.env.DIDIT_API_KEY! } })
  if (!res.ok) return new NextResponse('Upstream error', { status: res.status })

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  return new NextResponse(res.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
