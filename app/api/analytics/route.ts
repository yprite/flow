import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, trackPageView, getStats } from '@/lib/analytics-db'

// POST /api/analytics — track a page view
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const ua = req.headers.get('user-agent') || ''

    const common = {
      path: body.path || '/',
      referrer: body.referrer || 'direct',
      userAgent: ua,
      ip,
      sessionId: body.sessionId || ip,
    }

    if (body.type === 'event' || body.name) {
      await trackEvent({
        ...common,
        name: body.name || 'unknown_event',
        metadata: body.metadata || {},
      })
    } else {
      await trackPageView(common)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    console.error('[analytics] trackPageView 실패:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// GET /api/analytics — get stats
export async function GET(req: NextRequest) {
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
