// Analytics storage using Upstash Redis REST API (no SDK needed)

const KV_URL = process.env.KV_REST_API_URL || ''
const KV_TOKEN = process.env.KV_REST_API_TOKEN || ''

function ensureEnv() {
  if (!KV_URL || !KV_TOKEN) {
    throw new Error('KV_REST_API_URL / KV_REST_API_TOKEN 환경변수가 설정되지 않았습니다')
  }
}

async function kvPipeline(
  cmds: (string | number)[][],
): Promise<{ result: unknown }[]> {
  ensureEnv()
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmds),
  })
  if (!res.ok) {
    throw new Error(`Redis pipeline failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// ─── Referrer classification ───
export function classifyReferrer(ref: string): string {
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

// ─── Device classification ───
export function getDeviceType(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return '모바일'
  if (/tablet/i.test(ua)) return '태블릿'
  return 'PC'
}

const DAY_TTL = 90 * 24 * 60 * 60 // 90 days in seconds

// ─── Insert a page view ───
export async function trackPageView(params: {
  path: string
  referrer: string
  userAgent: string
  ip: string
  sessionId: string
}) {
  const now = Date.now()
  const d = new Date(now)
  const date = d.toISOString().slice(0, 10)
  const hour = d.getHours().toString()
  const referrerLabel = classifyReferrer(params.referrer)
  const device = getDeviceType(params.userAgent)
  const tenMinAgo = now - 10 * 60 * 1000
  const uid = `${now}:${Math.random().toString(36).slice(2, 8)}`

  await kvPipeline([
    ['INCR', 'a:total:views'],
    ['INCR', `a:dv:${date}`],
    ['SADD', `a:ds:${date}`, params.sessionId],
    ['HINCRBY', `a:h:${date}`, hour, 1],
    ['HINCRBY', `a:ref:${date}`, referrerLabel, 1],
    ['HINCRBY', 'a:ref:total', referrerLabel, 1],
    ['HINCRBY', `a:path:${date}`, params.path, 1],
    ['HINCRBY', `a:dev:${date}`, device, 1],
    ['HINCRBY', 'a:dev:total', device, 1],
    ['SADD', 'a:uv:all', `${params.sessionId}:${date}`],
    // Realtime sessions (sorted set: score=timestamp)
    ['ZADD', 'a:rt:sessions', now, params.sessionId],
    // Realtime page views (sorted set: score=timestamp, unique member per view)
    ['ZADD', 'a:rt:views', now, uid],
    // Cleanup old realtime entries (>10 min)
    ['ZREMRANGEBYSCORE', 'a:rt:sessions', '-inf', tenMinAgo],
    ['ZREMRANGEBYSCORE', 'a:rt:views', '-inf', tenMinAgo],
    // TTL on daily keys
    ['EXPIRE', `a:dv:${date}`, DAY_TTL],
    ['EXPIRE', `a:ds:${date}`, DAY_TTL],
    ['EXPIRE', `a:h:${date}`, DAY_TTL],
    ['EXPIRE', `a:ref:${date}`, DAY_TTL],
    ['EXPIRE', `a:path:${date}`, DAY_TTL],
    ['EXPIRE', `a:dev:${date}`, DAY_TTL],
  ])
}

export async function trackEvent(params: {
  name: string
  path: string
  referrer: string
  userAgent: string
  ip: string
  sessionId: string
  metadata?: Record<string, unknown>
}) {
  const now = Date.now()
  const d = new Date(now)
  const date = d.toISOString().slice(0, 10)

  await kvPipeline([
    ['HINCRBY', `a:evt:${date}`, params.name, 1],
    ['HINCRBY', 'a:evt:total', params.name, 1],
    ['EXPIRE', `a:evt:${date}`, DAY_TTL],
  ])
}

// ─── Parse Redis hash result to sorted Record<string, number> ───
function parseHash(raw: unknown): Record<string, number> {
  if (!raw) return {}
  // Upstash REST returns hashes as objects; handle flat array too
  let obj: Record<string, string>
  if (Array.isArray(raw)) {
    obj = {}
    for (let i = 0; i < raw.length; i += 2) obj[raw[i]] = raw[i + 1]
  } else {
    obj = raw as Record<string, string>
  }
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => [k, parseInt(String(v)) || 0] as [string, number])
      .sort((a, b) => b[1] - a[1]),
  )
}

// ─── Query stats ───
export async function getStats() {
  const now = Date.now()
  const today = new Date(now).toISOString().slice(0, 10)
  const fiveMinAgo = now - 5 * 60 * 1000

  const cmds: (string | number)[][] = [
    /* 0 */ ['ZCOUNT', 'a:rt:sessions', fiveMinAgo, '+inf'],
    /* 1 */ ['ZCOUNT', 'a:rt:views', fiveMinAgo, '+inf'],
    /* 2 */ ['GET', `a:dv:${today}`],
    /* 3 */ ['SCARD', `a:ds:${today}`],
    /* 4 */ ['HGETALL', `a:h:${today}`],
    /* 5 */ ['HGETALL', `a:ref:${today}`],
    /* 6 */ ['HGETALL', `a:path:${today}`],
    /* 7 */ ['HGETALL', `a:dev:${today}`],
    /* 8 */ ['GET', 'a:total:views'],
    /* 9 */ ['SCARD', 'a:uv:all'],
    /* 10 */ ['HGETALL', 'a:ref:total'],
    /* 11 */ ['HGETALL', 'a:dev:total'],
    /* 12 */ ['HGETALL', `a:evt:${today}`],
    /* 13 */ ['HGETALL', 'a:evt:total'],
  ]

  // 30-day trend: views + DAU for each day
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    cmds.push(['GET', `a:dv:${d}`])
    cmds.push(['SCARD', `a:ds:${d}`])
  }

  const results = await kvPipeline(cmds)
  const r = (i: number) => results[i]?.result

  // Parse hourly hash
  const hourlyRaw = r(4)
  const hourly = new Array(24).fill(0)
  if (hourlyRaw && typeof hourlyRaw === 'object') {
    const obj = Array.isArray(hourlyRaw)
      ? Object.fromEntries(
          Array.from({ length: hourlyRaw.length / 2 }, (_, i) => [
            hourlyRaw[i * 2],
            hourlyRaw[i * 2 + 1],
          ]),
        )
      : (hourlyRaw as Record<string, string>)
    for (const [k, v] of Object.entries(obj)) {
      const h = parseInt(k)
      if (h >= 0 && h < 24) hourly[h] = parseInt(String(v)) || 0
    }
  }

  // 30-day trend
  const trend: { date: string; views: number; dau: number }[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const baseIdx = 14 + i * 2
    trend.push({
      date: d,
      views: parseInt(String(r(baseIdx))) || 0,
      dau: (r(baseIdx + 1) as number) || 0,
    })
  }

  return {
    realtime: {
      activeNow: (r(0) as number) || 0,
      recentPageViews: (r(1) as number) || 0,
    },
    today: {
      views: parseInt(String(r(2))) || 0,
      dau: (r(3) as number) || 0,
      hourly,
      topReferrers: parseHash(r(5)),
      topPaths: parseHash(r(6)),
      devices: parseHash(r(7)),
      topEvents: parseHash(r(12)),
    },
    total: {
      views: parseInt(String(r(8))) || 0,
      uniqueVisitors: (r(9) as number) || 0,
      referrers: parseHash(r(10)),
      devices: parseHash(r(11)),
      events: parseHash(r(13)),
    },
    trend,
  }
}
