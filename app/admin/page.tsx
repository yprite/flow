'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Globe,
  TrendingUp,
  RefreshCw,
  Activity,
  Search,
} from 'lucide-react'

interface RealtimeData {
  activeNow: number
  recentPageViews: number
}

interface TodayData {
  views: number
  dau: number
  hourly: number[]
  topReferrers: Record<string, number>
  topPaths: Record<string, number>
  devices: Record<string, number>
  topEvents: Record<string, number>
}

interface TotalData {
  views: number
  uniqueVisitors: number
  referrers: Record<string, number>
  devices: Record<string, number>
  events: Record<string, number>
}

interface TrendItem {
  date: string
  views: number
  dau: number
}

interface Stats {
  realtime: RealtimeData
  today: TodayData
  total: TotalData
  trend: TrendItem[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analytics')
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError(`서버 응답 파싱 실패 (HTTP ${res.status})`)
        return
      }
      if (!res.ok) {
        setError(data.error || `조회 실패 (HTTP ${res.status})`)
        return
      }
      setStats(data)
    } catch (e) {
      setError(`서버 연결 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!stats) return
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats, stats])

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-2xl font-black text-white">기름값 헌터 Analytics</h1>
          <p className="mt-3 text-sm text-slate-400">
            Vercel 보호 뒤에 있는 관리자 페이지입니다. 데이터를 불러오는 중입니다.
          </p>
          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const maxHourly = Math.max(...stats.today.hourly, 1)
  const maxTrendViews = Math.max(...stats.trend.map((t) => t.views), 1)
  const maxTrendDau = Math.max(...stats.trend.map((t) => t.dau), 1)
  const trendLastIndex = stats.trend.length - 1
  const trendLabelStep = stats.trend.length > 20 ? 5 : 3

  const totalReferrerCount = Object.values(stats.total.referrers).reduce((a, b) => a + b, 0) || 1
  const totalDeviceCount = Object.values(stats.today.devices).reduce((a, b) => a + b, 0) || 1
  const todaySearches = stats.today.topEvents.search_executed || 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl font-black">기름값 헌터 Analytics</h1>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* ── Summary Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <SummaryCard
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            label="현재 접속자"
            value={stats.realtime.activeNow}
            sub="최근 5분"
            color="emerald"
          />
          <SummaryCard
            icon={<Users className="w-5 h-5 text-sky-400" />}
            label="오늘 DAU"
            value={stats.today.dau}
            sub="순 방문자"
            color="sky"
          />
          <SummaryCard
            icon={<Eye className="w-5 h-5 text-amber-400" />}
            label="오늘 PV"
            value={stats.today.views}
            sub="페이지뷰"
            color="amber"
          />
          <SummaryCard
            icon={<TrendingUp className="w-5 h-5 text-rose-400" />}
            label="누적 PV"
            value={stats.total.views}
            sub="전체 기간"
            color="rose"
          />
          <SummaryCard
            icon={<Search className="w-5 h-5 text-violet-400" />}
            label="오늘 검색 실행"
            value={todaySearches}
            sub="핵심 행동"
            color="violet"
          />
        </div>

        {/* ── 30-Day Trend ─── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-white sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              30일 트렌드
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                페이지뷰
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                순 방문자
              </span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              <div className="flex items-end gap-2 h-56">
                {stats.trend.map((day, index) => {
                  const heightPV = (day.views / maxTrendViews) * 100
                  const heightDAU = (day.dau / maxTrendDau) * 100
                  const isToday = index === trendLastIndex
                  const showTrendLabel =
                    index === 0 || index === trendLastIndex || index % trendLabelStep === 0
                  return (
                    <div
                      key={day.date}
                      className="group relative flex h-full w-10 shrink-0 flex-col items-center gap-2"
                    >
                      <div className="flex h-full w-full items-end gap-1">
                        <div
                          className={`flex-1 rounded-t-md ${isToday ? 'bg-sky-400' : 'bg-sky-600/60'} transition-all`}
                          style={{ height: `${heightPV}%`, minHeight: day.views > 0 ? '6px' : '0' }}
                        />
                        <div
                          className={`flex-1 rounded-t-md ${isToday ? 'bg-emerald-400' : 'bg-emerald-600/60'} transition-all`}
                          style={{ height: `${heightDAU}%`, minHeight: day.dau > 0 ? '6px' : '0' }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-medium ${
                          showTrendLabel ? 'text-slate-400' : 'text-transparent'
                        }`}
                      >
                        {showTrendLabel ? day.date.slice(5) : '00-00'}
                      </span>
                      <div className="absolute -top-20 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-xl group-hover:block">
                        <div className="font-bold">{day.date.slice(5)}</div>
                        <div className="text-sky-400">PV: {day.views}</div>
                        <div className="text-emerald-400">DAU: {day.dau}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Hourly Distribution ─── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white sm:text-lg">시간대별 접속 (오늘)</h2>
              <span className="text-sm text-slate-400">0시부터 24시까지</span>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[640px]">
                <div className="flex items-end gap-1.5 h-40">
                  {stats.today.hourly.map((count, h) => {
                    const height = (count / maxHourly) * 100
                    const now = new Date().getHours()
                    const showHourLabel = h === 0 || h === 23 || h % 3 === 0
                    return (
                      <div
                        key={h}
                        className="group relative flex h-full w-8 shrink-0 flex-col items-center gap-2"
                      >
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            h === now ? 'bg-rose-500' : 'bg-slate-600'
                          }`}
                          style={{ height: `${height}%`, minHeight: count > 0 ? '6px' : '0' }}
                        />
                        <span
                          className={`text-[11px] font-medium ${
                            showHourLabel ? 'text-slate-400' : 'text-transparent'
                          }`}
                        >
                          {showHourLabel ? `${h}시` : '00시'}
                        </span>
                        <div className="absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm shadow-xl group-hover:block">
                          {h}시: {count}건
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Referrer Sources ─── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              유입 경로 (전체)
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.total.referrers).slice(0, 8).map(([source, count]) => {
                const pct = (count / totalReferrerCount) * 100
                return (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{source}</span>
                      <span className="text-slate-500">
                        {count}건 ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(stats.total.referrers).length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">아직 데이터가 없습니다</p>
              )}
            </div>
          </div>
          

          {/* ── Device Breakdown ─── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              디바이스 (오늘)
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.today.devices).map(([device, count]) => {
                const pct = (count / totalDeviceCount) * 100
                const Icon = device === '모바일' ? Smartphone : Monitor
                return (
                  <div key={device} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{device}</span>
                        <span className="text-slate-500">{count}건 ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
              {Object.keys(stats.today.devices).length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">아직 데이터가 없습니다</p>
              )}
            </div>
          </div>

          {/* ── Top Pages ─── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              인기 페이지 (오늘)
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.today.topPaths).slice(0, 8).map(([path, count], i) => (
                <div key={path} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <span className="text-xs font-bold text-slate-600 w-6 text-right">{i + 1}</span>
                  <span className="text-sm text-slate-300 flex-1 truncate font-mono">{path}</span>
                  <span className="text-sm font-bold text-slate-400">{count}</span>
                </div>
              ))}
              {Object.keys(stats.today.topPaths).length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">아직 데이터가 없습니다</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" />
              핵심 이벤트 (오늘)
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.today.topEvents).slice(0, 8).map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <span className="text-xs font-bold text-slate-600 w-6 text-right">{i + 1}</span>
                  <span className="text-sm text-slate-300 flex-1 truncate font-mono">{name}</span>
                  <span className="text-sm font-bold text-slate-400">{count}</span>
                </div>
              ))}
              {Object.keys(stats.today.topEvents).length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">아직 이벤트 데이터가 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Summary Card ───
function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  sub: string
  color: string
}) {
  const borderColor: Record<string, string> = {
    emerald: 'border-emerald-800/50',
    sky: 'border-sky-800/50',
    amber: 'border-amber-800/50',
    rose: 'border-rose-800/50',
    violet: 'border-violet-800/50',
  }
  return (
    <div className={`bg-slate-900 border ${borderColor[color] || 'border-slate-800'} rounded-2xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="text-3xl font-black">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-600 mt-1">{sub}</div>
    </div>
  )
}
