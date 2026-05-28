import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePdf } from '@/lib/didit/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify this candidate is accessible to the user
  const { data: candidate } = await supabase
    .from('candidates')
    .select('didit_session_id')
    .eq('id', id)
    .single()

  if (!candidate?.didit_session_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const res = await generatePdf(candidate.didit_session_id)
    const pdf = await res.arrayBuffer()
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-${id}.pdf"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PDF generation failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
