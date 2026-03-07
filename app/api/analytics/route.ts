import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, getStats } from '@/lib/analytics-db'

const ADMIN_USER = 'yprite'
const ADMIN_PASS = '12345'

// POST /api/analytics — track a page view
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const ua = req.headers.get('user-agent') || ''

    trackPageView({
      path: body.path || '/',
      referrer: body.referrer || 'direct',
      userAgent: ua,
      ip,
      sessionId: body.sessionId || ip,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

// GET /api/analytics?user=xxx&pass=xxx — get stats (admin only)
export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get('user')
  const pass = req.nextUrl.searchParams.get('pass')

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const stats = getStats()
  return NextResponse.json(stats)
}
