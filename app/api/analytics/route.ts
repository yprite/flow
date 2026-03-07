import { NextRequest, NextResponse } from 'next/server'

// ─── In-memory analytics store ──────────────────────────────
interface PageView {
  timestamp: number
  path: string
  referrer: string
  userAgent: string
  ip: string
  sessionId: string
}

interface DailyStats {
  date: string
  views: number
  uniqueVisitors: Set<string>
  referrers: Map<string, number>
  paths: Map<string, number>
  devices: Map<string, number>
  hourly: number[]
}

const pageViews: PageView[] = []
const dailyStats = new Map<string, DailyStats>()

const ADMIN_USER = 'yprite'
const ADMIN_PASS = '12345'

function getDateStr(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function getDeviceType(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return '모바일'
  if (/tablet/i.test(ua)) return '태블릿'
  return 'PC'
}

function classifyReferrer(ref: string): string {
  if (!ref || ref === '' || ref === 'direct') return '직접 접속'
  if (/naver\.com/i.test(ref)) return '네이버'
  if (/google\./i.test(ref)) return '구글'
  if (/daum\.net|kakao/i.test(ref)) return '다음/카카오'
  if (/instagram/i.test(ref)) return '인스타그램'
  if (/facebook|fb\./i.test(ref)) return '페이스북'
  if (/twitter|x\.com/i.test(ref)) return '트위터/X'
  if (/youtube/i.test(ref)) return '유튜브'
  if (/t\.me|telegram/i.test(ref)) return '텔레그램'
  if (/blog/i.test(ref)) return '블로그'
  if (/cafe/i.test(ref)) return '카페'
  try {
    return new URL(ref).hostname
  } catch {
    return ref.slice(0, 30)
  }
}

function ensureDaily(date: string): DailyStats {
  if (!dailyStats.has(date)) {
    dailyStats.set(date, {
      date,
      views: 0,
      uniqueVisitors: new Set(),
      referrers: new Map(),
      paths: new Map(),
      devices: new Map(),
      hourly: new Array(24).fill(0),
    })
  }
  return dailyStats.get(date)!
}

// POST /api/analytics — track a page view
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const now = Date.now()
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const ua = req.headers.get('user-agent') || ''

    const pv: PageView = {
      timestamp: now,
      path: body.path || '/',
      referrer: body.referrer || 'direct',
      userAgent: ua,
      ip,
      sessionId: body.sessionId || ip,
    }
    pageViews.push(pv)

    // Keep only last 7 days of raw data
    const cutoff = now - 7 * 24 * 60 * 60 * 1000
    while (pageViews.length > 0 && pageViews[0].timestamp < cutoff) {
      pageViews.shift()
    }

    // Update daily stats
    const date = getDateStr(now)
    const daily = ensureDaily(date)
    daily.views++
    daily.uniqueVisitors.add(pv.sessionId)

    const refLabel = classifyReferrer(pv.referrer)
    daily.referrers.set(refLabel, (daily.referrers.get(refLabel) || 0) + 1)
    daily.paths.set(pv.path, (daily.paths.get(pv.path) || 0) + 1)

    const device = getDeviceType(ua)
    daily.devices.set(device, (daily.devices.get(device) || 0) + 1)

    const hour = new Date(now).getHours()
    daily.hourly[hour]++

    // Cleanup old daily stats (keep 30 days)
    const cutoffDate = getDateStr(now - 30 * 24 * 60 * 60 * 1000)
    for (const key of dailyStats.keys()) {
      if (key < cutoffDate) dailyStats.delete(key)
    }

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

  const now = Date.now()
  const today = getDateStr(now)
  const todayStats = dailyStats.get(today)

  // Build last 30 days trend
  const trend: { date: string; views: number; dau: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = getDateStr(now - i * 24 * 60 * 60 * 1000)
    const s = dailyStats.get(d)
    trend.push({
      date: d,
      views: s?.views || 0,
      dau: s?.uniqueVisitors.size || 0,
    })
  }

  // Aggregate referrers across all days
  const totalReferrers = new Map<string, number>()
  const totalDevices = new Map<string, number>()
  let totalViews = 0
  let totalUnique = 0

  for (const s of dailyStats.values()) {
    totalViews += s.views
    totalUnique += s.uniqueVisitors.size
    for (const [k, v] of s.referrers) {
      totalReferrers.set(k, (totalReferrers.get(k) || 0) + v)
    }
    for (const [k, v] of s.devices) {
      totalDevices.set(k, (totalDevices.get(k) || 0) + v)
    }
  }

  // Current active (last 5 min)
  const fiveMinAgo = now - 5 * 60 * 1000
  const recentViews = pageViews.filter((pv) => pv.timestamp > fiveMinAgo)
  const activeNow = new Set(recentViews.map((pv) => pv.sessionId)).size

  return NextResponse.json({
    realtime: {
      activeNow,
      recentPageViews: recentViews.length,
    },
    today: {
      views: todayStats?.views || 0,
      dau: todayStats?.uniqueVisitors.size || 0,
      hourly: todayStats?.hourly || new Array(24).fill(0),
      topReferrers: Object.fromEntries(
        [...(todayStats?.referrers || [])].sort((a, b) => b[1] - a[1]),
      ),
      topPaths: Object.fromEntries(
        [...(todayStats?.paths || [])].sort((a, b) => b[1] - a[1]),
      ),
      devices: Object.fromEntries(todayStats?.devices || []),
    },
    total: {
      views: totalViews,
      uniqueVisitors: totalUnique,
      referrers: Object.fromEntries(
        [...totalReferrers].sort((a, b) => b[1] - a[1]),
      ),
      devices: Object.fromEntries(
        [...totalDevices].sort((a, b) => b[1] - a[1]),
      ),
    },
    trend,
  })
}
