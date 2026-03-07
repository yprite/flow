import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'analytics.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  // Ensure data directory exists
  const fs = require('fs')
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('busy_timeout = 5000')

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      date TEXT NOT NULL,
      hour INTEGER NOT NULL,
      path TEXT NOT NULL,
      referrer TEXT NOT NULL DEFAULT 'direct',
      referrer_label TEXT NOT NULL DEFAULT '직접 접속',
      user_agent TEXT NOT NULL DEFAULT '',
      device TEXT NOT NULL DEFAULT 'PC',
      ip TEXT NOT NULL DEFAULT 'unknown',
      session_id TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pv_date ON page_views(date);
    CREATE INDEX IF NOT EXISTS idx_pv_timestamp ON page_views(timestamp);
    CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views(session_id, date);
  `)

  return _db
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

// ─── Insert a page view ───
export function trackPageView(params: {
  path: string
  referrer: string
  userAgent: string
  ip: string
  sessionId: string
}) {
  const db = getDb()
  const now = Date.now()
  const d = new Date(now)
  const date = d.toISOString().slice(0, 10)
  const hour = d.getHours()
  const referrerLabel = classifyReferrer(params.referrer)
  const device = getDeviceType(params.userAgent)

  const stmt = db.prepare(`
    INSERT INTO page_views (timestamp, date, hour, path, referrer, referrer_label, user_agent, device, ip, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(now, date, hour, params.path, params.referrer, referrerLabel, params.userAgent, device, params.ip, params.sessionId)
}

// ─── Query stats ───
export function getStats() {
  const db = getDb()
  const now = Date.now()
  const today = new Date(now).toISOString().slice(0, 10)
  const fiveMinAgo = now - 5 * 60 * 1000

  // Realtime: active in last 5 minutes
  const realtimeRow = db.prepare(`
    SELECT COUNT(DISTINCT session_id) as active, COUNT(*) as views
    FROM page_views WHERE timestamp > ?
  `).get(fiveMinAgo) as { active: number; views: number }

  // Today stats
  const todayRow = db.prepare(`
    SELECT COUNT(*) as views, COUNT(DISTINCT session_id) as dau
    FROM page_views WHERE date = ?
  `).get(today) as { views: number; dau: number }

  // Today hourly
  const hourlyRows = db.prepare(`
    SELECT hour, COUNT(*) as cnt FROM page_views WHERE date = ? GROUP BY hour
  `).all(today) as { hour: number; cnt: number }[]
  const hourly = new Array(24).fill(0)
  for (const r of hourlyRows) hourly[r.hour] = r.cnt

  // Today referrers
  const todayReferrers = db.prepare(`
    SELECT referrer_label as label, COUNT(*) as cnt
    FROM page_views WHERE date = ?
    GROUP BY referrer_label ORDER BY cnt DESC
  `).all(today) as { label: string; cnt: number }[]

  // Today paths
  const todayPaths = db.prepare(`
    SELECT path, COUNT(*) as cnt
    FROM page_views WHERE date = ?
    GROUP BY path ORDER BY cnt DESC
  `).all(today) as { path: string; cnt: number }[]

  // Today devices
  const todayDevices = db.prepare(`
    SELECT device, COUNT(*) as cnt
    FROM page_views WHERE date = ?
    GROUP BY device ORDER BY cnt DESC
  `).all(today) as { device: string; cnt: number }[]

  // Total stats
  const totalRow = db.prepare(`
    SELECT COUNT(*) as views, COUNT(DISTINCT session_id || date) as uniq
    FROM page_views
  `).get() as { views: number; uniq: number }

  // Total referrers
  const totalReferrers = db.prepare(`
    SELECT referrer_label as label, COUNT(*) as cnt
    FROM page_views GROUP BY referrer_label ORDER BY cnt DESC
  `).all() as { label: string; cnt: number }[]

  // Total devices
  const totalDevices = db.prepare(`
    SELECT device, COUNT(*) as cnt
    FROM page_views GROUP BY device ORDER BY cnt DESC
  `).all() as { device: string; cnt: number }[]

  // 30-day trend
  const thirtyDaysAgo = new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const trendRows = db.prepare(`
    SELECT date, COUNT(*) as views, COUNT(DISTINCT session_id) as dau
    FROM page_views WHERE date >= ?
    GROUP BY date ORDER BY date
  `).all(thirtyDaysAgo) as { date: string; views: number; dau: number }[]

  const trendMap = new Map(trendRows.map((r) => [r.date, r]))
  const trend: { date: string; views: number; dau: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const row = trendMap.get(d)
    trend.push({ date: d, views: row?.views || 0, dau: row?.dau || 0 })
  }

  return {
    realtime: {
      activeNow: realtimeRow?.active || 0,
      recentPageViews: realtimeRow?.views || 0,
    },
    today: {
      views: todayRow?.views || 0,
      dau: todayRow?.dau || 0,
      hourly,
      topReferrers: Object.fromEntries(todayReferrers.map((r) => [r.label, r.cnt])),
      topPaths: Object.fromEntries(todayPaths.map((r) => [r.path, r.cnt])),
      devices: Object.fromEntries(todayDevices.map((r) => [r.device, r.cnt])),
    },
    total: {
      views: totalRow?.views || 0,
      uniqueVisitors: totalRow?.uniq || 0,
      referrers: Object.fromEntries(totalReferrers.map((r) => [r.label, r.cnt])),
      devices: Object.fromEntries(totalDevices.map((r) => [r.device, r.cnt])),
    },
    trend,
  }
}
