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

    await trackPageView({
      path: body.path || '/',
      referrer: body.referrer || 'direct',
      userAgent: ua,
      ip,
      sessionId: body.sessionId || ip,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    console.error('[analytics] trackPageView 실패:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// GET /api/analytics?user=xxx&pass=xxx — get stats (admin only)
export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get('user')
  const pass = req.nextUrl.searchParams.get('pass')

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  try {
    const stats = await getStats()
    return NextResponse.json(stats)
  } catch (e) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    console.error('[analytics] getStats 실패:', message)
    return NextResponse.json(
      { error: `데이터 조회 실패: ${message}` },
      { status: 500 },
    )
  }
}
