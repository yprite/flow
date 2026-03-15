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
  MapPin,
  House,
  Star,
  BellRing,
  History,
  WifiOff,
  Download,
} from 'lucide-react'

type EventDimensionStats = Record<string, Record<string, Record<string, number>>>

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
  eventDimensions: EventDimensionStats
}

interface TotalData {
  views: number
  uniqueVisitors: number
  referrers: Record<string, number>
  devices: Record<string, number>
  events: Record<string, number>
  eventDimensions: EventDimensionStats
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
  const totalReferrerCount = Object.values(stats.total.referrers).reduce((a, b) => a + b, 0) || 1
  const totalDeviceCount = Object.values(stats.today.devices).reduce((a, b) => a + b, 0) || 1
  const todaySearches = stats.today.topEvents.search_executed || 0
  const searchFuelBreakdown = stats.today.eventDimensions.search_executed?.fuel || {}
  const searchRadiusBreakdown = stats.today.eventDimensions.search_executed?.radius || {}
  const searchVisitBreakdown = stats.today.eventDimensions.search_executed?.repeatVisit || {}
  const searchLocationBreakdown = stats.today.eventDimensions.search_executed?.locationSource || {}
  const mapProviderBreakdown = stats.today.eventDimensions.map_click?.provider || {}
  const savedLocationBreakdown = stats.today.eventDimensions.saved_location?.slot || {}
  const favoriteActionBreakdown = stats.today.eventDimensions.favorite_station_toggled?.action || {}
  const alertPermissionBreakdown =
    stats.today.eventDimensions.price_alert_permission_updated?.permission ||
    stats.today.eventDimensions.price_alert_saved?.permission ||
    {}
  const alertTriggerChannelBreakdown =
    stats.today.eventDimensions.price_alert_triggered?.channel || {}
  const installPromptSurfaceBreakdown =
    stats.today.eventDimensions.install_prompt_viewed?.surface || {}
  const installPromptPlatformBreakdown =
    stats.today.eventDimensions.install_prompt_accepted?.platform || {}
  const pwaLaunchBreakdown =
    stats.today.eventDimensions.pwa_launch?.mode || {}
  const shortcutBreakdown =
    stats.today.eventDimensions.pwa_shortcut_opened?.shortcut || {}
  const quickActionBreakdown =
    stats.today.eventDimensions.home_quick_action_opened?.action || {}
  const cachedSearchBreakdown =
    stats.today.eventDimensions.cached_search_loaded?.reason || {}
  const averageCacheBreakdown =
    stats.today.eventDimensions.average_cache_loaded?.reason || {}

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
        <TrendChartCard trend={stats.trend} maxTrendViews={maxTrendViews} maxTrendDau={maxTrendDau} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Hourly Distribution ─── */}
          <HourlyChartCard hourly={stats.today.hourly} maxHourly={maxHourly} />

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

          <BreakdownCard
            title="검색 유종 분포"
            icon={<Search className="w-4 h-4" />}
            data={searchFuelBreakdown}
            emptyText="아직 검색 유종 데이터가 없습니다"
          />

          <BreakdownCard
            title="검색 반경 분포"
            icon={<MapPin className="w-4 h-4" />}
            data={searchRadiusBreakdown}
            emptyText="아직 반경 분포 데이터가 없습니다"
          />

          <BreakdownCard
            title="방문자 상태"
            icon={<Users className="w-4 h-4" />}
            data={searchVisitBreakdown}
            emptyText="아직 재방문 구분 데이터가 없습니다"
          />

          <BreakdownCard
            title="위치 소스"
            icon={<Activity className="w-4 h-4" />}
            data={searchLocationBreakdown}
            emptyText="아직 위치 소스 데이터가 없습니다"
          />

          <BreakdownCard
            title="지도 앱 분포"
            icon={<Globe className="w-4 h-4" />}
            data={mapProviderBreakdown}
            emptyText="아직 지도 클릭 데이터가 없습니다"
          />

          <BreakdownCard
            title="저장 위치 액션"
            icon={<House className="w-4 h-4" />}
            data={savedLocationBreakdown}
            emptyText="아직 저장 위치 데이터가 없습니다"
          />

          <BreakdownCard
            title="즐겨찾기 액션"
            icon={<Star className="w-4 h-4" />}
            data={favoriteActionBreakdown}
            emptyText="아직 즐겨찾기 데이터가 없습니다"
          />

          <BreakdownCard
            title="알림 권한 상태"
            icon={<BellRing className="w-4 h-4" />}
            data={alertPermissionBreakdown}
            emptyText="아직 알림 권한 데이터가 없습니다"
          />

          <BreakdownCard
            title="알림 트리거 채널"
            icon={<BellRing className="w-4 h-4" />}
            data={alertTriggerChannelBreakdown}
            emptyText="아직 알림 트리거 데이터가 없습니다"
          />

          <BreakdownCard
            title="설치 배너 노출 위치"
            icon={<Download className="w-4 h-4" />}
            data={installPromptSurfaceBreakdown}
            emptyText="아직 설치 배너 노출 데이터가 없습니다"
          />

          <BreakdownCard
            title="설치 수락 플랫폼"
            icon={<Smartphone className="w-4 h-4" />}
            data={installPromptPlatformBreakdown}
            emptyText="아직 설치 수락 데이터가 없습니다"
          />

          <BreakdownCard
            title="PWA 실행 모드"
            icon={<Activity className="w-4 h-4" />}
            data={pwaLaunchBreakdown}
            emptyText="아직 PWA 실행 데이터가 없습니다"
          />

          <BreakdownCard
            title="앱 숏컷 진입"
            icon={<ZapShortcutIcon />}
            data={shortcutBreakdown}
            emptyText="아직 앱 숏컷 진입 데이터가 없습니다"
          />

          <BreakdownCard
            title="홈 빠른 실행 클릭"
            icon={<History className="w-4 h-4" />}
            data={quickActionBreakdown}
            emptyText="아직 홈 빠른 실행 데이터가 없습니다"
          />

          <BreakdownCard
            title="검색 결과 캐시 복원"
            icon={<WifiOff className="w-4 h-4" />}
            data={cachedSearchBreakdown}
            emptyText="아직 검색 캐시 복원 데이터가 없습니다"
          />

          <BreakdownCard
            title="평균가 캐시 복원"
            icon={<WifiOff className="w-4 h-4" />}
            data={averageCacheBreakdown}
            emptyText="아직 평균가 캐시 복원 데이터가 없습니다"
          />
        </div>
      </main>
    </div>
  )
}

function ZapShortcutIcon() {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
      <span className="text-[10px] font-black">S</span>
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

function BreakdownCard({
  title,
  icon,
  data,
  emptyText,
}: {
  title: string
  icon: React.ReactNode
  data: Record<string, number>
  emptyText: string
}) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1
  const entries = Object.entries(data)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-3">
        {entries.slice(0, 6).map(([label, count]) => {
          const pct = (count / total) * 100
          return (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{label}</span>
                <span className="text-slate-500">
                  {count}건 ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        {entries.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-4">{emptyText}</p>
        )}
      </div>
    </div>
  )
}

interface ChartPoint {
  x: number
  y: number
  label: string
  value: number
}

const TREND_CHART_SIZE = {
  width: 720,
  height: 240,
  padding: { top: 18, right: 18, bottom: 34, left: 12 },
}

const HOURLY_CHART_SIZE = {
  width: 720,
  height: 210,
  padding: { top: 18, right: 18, bottom: 34, left: 12 },
}

function TrendChartCard({
  trend,
  maxTrendViews,
  maxTrendDau,
}: {
  trend: TrendItem[]
  maxTrendViews: number
  maxTrendDau: number
}) {
  if (trend.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <TrendingUp className="h-5 w-5 text-sky-400" />
          30일 트렌드
        </h2>
        <p className="mt-6 text-sm text-slate-500">표시할 추세 데이터가 아직 없습니다.</p>
      </div>
    )
  }

  const chartMax = Math.max(maxTrendViews, maxTrendDau, 1)
  const step = trend.length > 18 ? 5 : 3
  const viewsPoints = createLinePoints(
    trend.map((item) => item.views),
    trend.map((item) => formatChartDate(item.date)),
    chartMax,
    TREND_CHART_SIZE
  )
  const dauPoints = createLinePoints(
    trend.map((item) => item.dau),
    trend.map((item) => formatChartDate(item.date)),
    chartMax,
    TREND_CHART_SIZE
  )
  const trendPathViews = buildLinePath(viewsPoints)
  const trendPathDau = buildLinePath(dauPoints)
  const xLabels = viewsPoints.filter(
    (_, index) => index === 0 || index === viewsPoints.length - 1 || index % step === 0
  )
  const peakViews = trend.reduce((best, item) => (item.views > best.views ? item : best), trend[0])
  const peakDau = trend.reduce((best, item) => (item.dau > best.dau ? item : best), trend[0])
  const latest = trend[trend.length - 1]

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <TrendingUp className="h-5 w-5 text-sky-400" />
            30일 트렌드
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            30개 날짜를 막대 대신 선으로 압축해 흐름을 먼저 보이고, 라벨은 필요한 지점만 남겼습니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ChartStat label="최고 PV" value={`${peakViews.views} · ${formatChartDate(peakViews.date)}`} tone="sky" />
          <ChartStat label="최고 DAU" value={`${peakDau.dau} · ${formatChartDate(peakDau.date)}`} tone="emerald" />
          <ChartStat label="오늘" value={`PV ${latest.views} / DAU ${latest.dau}`} tone="slate" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>0</span>
          <span>최대 {chartMax}</span>
        </div>
        <svg
          viewBox={`0 0 ${TREND_CHART_SIZE.width} ${TREND_CHART_SIZE.height}`}
          className="h-56 w-full"
          aria-label="지난 30일 PV와 DAU 선형 차트"
          role="img"
        >
          {createGridLines(TREND_CHART_SIZE, 4).map((y) => (
            <line
              key={y}
              x1={TREND_CHART_SIZE.padding.left}
              x2={TREND_CHART_SIZE.width - TREND_CHART_SIZE.padding.right}
              y1={y}
              y2={y}
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth="1"
            />
          ))}

          {xLabels.map((point) => (
            <text
              key={point.label}
              x={point.x}
              y={TREND_CHART_SIZE.height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="rgb(148 163 184)"
            >
              {point.label}
            </text>
          ))}

          <path
            d={trendPathViews}
            fill="none"
            stroke="rgb(56 189 248)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={trendPathDau}
            fill="none"
            stroke="rgb(52 211 153)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {viewsPoints.map((point, index) => (
            <circle
              key={`views-${point.label}`}
              cx={point.x}
              cy={point.y}
              r={index === viewsPoints.length - 1 ? 4.5 : 3}
              fill="rgb(56 189 248)"
            >
              <title>{`${point.label} PV ${trend[index].views}`}</title>
            </circle>
          ))}

          {dauPoints.map((point, index) => (
            <circle
              key={`dau-${point.label}`}
              cx={point.x}
              cy={point.y}
              r={index === dauPoints.length - 1 ? 4.5 : 3}
              fill="rgb(52 211 153)"
            >
              <title>{`${point.label} DAU ${trend[index].dau}`}</title>
            </circle>
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            페이지뷰
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            순 방문자
          </span>
        </div>
      </div>
    </section>
  )
}

function HourlyChartCard({
  hourly,
  maxHourly,
}: {
  hourly: number[]
  maxHourly: number
}) {
  if (hourly.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-bold text-white">시간대별 접속 (오늘)</h2>
        <p className="mt-6 text-sm text-slate-500">시간대 데이터가 아직 없습니다.</p>
      </div>
    )
  }

  const slotWidth =
    (HOURLY_CHART_SIZE.width - HOURLY_CHART_SIZE.padding.left - HOURLY_CHART_SIZE.padding.right) /
    hourly.length
  const barWidth = Math.max(slotWidth * 0.58, 10)
  const peakHour = hourly.findIndex((count) => count === maxHourly)
  const currentHour = new Date().getHours()
  const hourLabels = new Set([0, 6, 12, 18, hourly.length - 1])

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">시간대별 접속 (오늘)</h2>
          <p className="mt-1 text-sm text-slate-400">
            레이블은 3시간 간격만 노출하고, 피크 시간과 현재 시간을 색으로 구분했습니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChartStat label="피크 시간" value={`${peakHour}시 · ${maxHourly}건`} tone="rose" />
          <ChartStat label="현재 시각" value={`${currentHour}시`} tone="slate" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>0</span>
          <span>최대 {maxHourly}</span>
        </div>
        <svg
          viewBox={`0 0 ${HOURLY_CHART_SIZE.width} ${HOURLY_CHART_SIZE.height}`}
          className="h-48 w-full"
          aria-label="오늘 시간대별 접속 막대 차트"
          role="img"
        >
          {createGridLines(HOURLY_CHART_SIZE, 4).map((y) => (
            <line
              key={y}
              x1={HOURLY_CHART_SIZE.padding.left}
              x2={HOURLY_CHART_SIZE.width - HOURLY_CHART_SIZE.padding.right}
              y1={y}
              y2={y}
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth="1"
            />
          ))}

          {hourly.map((count, hour) => {
            const x = HOURLY_CHART_SIZE.padding.left + hour * slotWidth + (slotWidth - barWidth) / 2
            const y = scaleValueToY(count, maxHourly, HOURLY_CHART_SIZE)
            const height = HOURLY_CHART_SIZE.height - HOURLY_CHART_SIZE.padding.bottom - y
            const fill =
              hour === peakHour
                ? 'rgb(244 63 94)'
                : hour === currentHour
                  ? 'rgb(251 146 60)'
                  : 'rgb(100 116 139)'

            return (
              <g key={hour}>
                <rect x={x} y={y} width={barWidth} height={Math.max(height, 4)} rx="6" fill={fill}>
                  <title>{`${hour}시: ${count}건`}</title>
                </rect>
                {hourLabels.has(hour) && (
                  <text
                    x={x + barWidth / 2}
                    y={HOURLY_CHART_SIZE.height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill="rgb(148 163 184)"
                  >
                    {hour === hourly.length - 1 ? '24시' : `${hour}시`}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}

function ChartStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'sky' | 'emerald' | 'rose' | 'slate'
}) {
  const toneClasses: Record<typeof tone, string> = {
    sky: 'border-sky-900/70 bg-sky-950/40 text-sky-200',
    emerald: 'border-emerald-900/70 bg-emerald-950/40 text-emerald-200',
    rose: 'border-rose-900/70 bg-rose-950/40 text-rose-200',
    slate: 'border-slate-800 bg-slate-950/40 text-slate-200',
  }

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClasses[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

function formatChartDate(value: string) {
  if (value.length < 10) return value
  return value.slice(5).replace('-', '.')
}

function createLinePoints(
  values: number[],
  labels: string[],
  maxValue: number,
  chartSize: { width: number; height: number; padding: { top: number; right: number; bottom: number; left: number } }
) {
  const usableWidth = chartSize.width - chartSize.padding.left - chartSize.padding.right

  return values.map((value, index) => ({
    x:
      values.length === 1
        ? chartSize.padding.left + usableWidth / 2
        : chartSize.padding.left + (usableWidth * index) / (values.length - 1),
    y: scaleValueToY(value, maxValue, chartSize),
    label: labels[index] ?? `${index + 1}`,
    value,
  }))
}

function scaleValueToY(
  value: number,
  maxValue: number,
  chartSize: { width: number; height: number; padding: { top: number; right: number; bottom: number; left: number } }
) {
  const safeMax = Math.max(maxValue, 1)
  const usableHeight = chartSize.height - chartSize.padding.top - chartSize.padding.bottom
  return chartSize.padding.top + usableHeight - (value / safeMax) * usableHeight
}

function buildLinePath(points: ChartPoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

function createGridLines(
  chartSize: { width: number; height: number; padding: { top: number; right: number; bottom: number; left: number } },
  count: number
) {
  const usableHeight = chartSize.height - chartSize.padding.top - chartSize.padding.bottom

  return Array.from({ length: count }, (_, index) => {
    if (count === 1) return chartSize.padding.top + usableHeight / 2
    return chartSize.padding.top + (usableHeight * index) / (count - 1)
  })
}
