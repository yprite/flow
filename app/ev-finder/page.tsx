'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Search,
  MapPin,
  Loader2,
  AlertTriangle,
  Navigation,
  ExternalLink,
  Clock,
  ArrowLeft,
  Battery,
  BatteryCharging,
  CircleParking,
  WifiOff,
} from 'lucide-react'
import { ServiceShareButton } from '@/components/service-share-button'
import { SiteFooter } from '@/components/site-footer'
import { trackEvent, trackPageView } from '@/lib/analytics-client'

// ─── Types ─────────────────────────────────────────────────────
interface Charger {
  type: string
  typeName: string
  output: number
  status: string
  statusName: string
  isFast: boolean
  price: number
  updatedAt: string
}

interface Station {
  rank: number
  id: string
  name: string
  addr: string
  lat: number
  lng: number
  distance: number
  operator: string
  operatorId: string
  useTime: string
  parkingFree: boolean
  limitYn: boolean
  limitDetail: string
  chargers: Charger[]
  fastCount: number
  slowCount: number
  totalCount: number
  availableCount: number
  minPrice: number
  maxOutput: number
}

type LocationSource = 'preset' | 'geolocation' | 'fallback'

// ─── Constants ─────────────────────────────────────────────────
const CHARGER_FILTERS = [
  { code: 'all', label: '전체', emoji: '\u26A1' },
  { code: 'fast', label: '급속', emoji: '\u{1F50B}' },
  { code: 'slow', label: '완속', emoji: '\u{1F50C}' },
]

const RADIUS_OPTIONS = [
  { value: 1000, label: '1km', desc: '걸어갈 수 있는 거리' },
  { value: 2000, label: '2km', desc: '자전거 거리' },
  { value: 3000, label: '3km', desc: '적당적당' },
  { value: 5000, label: '5km', desc: '차 타고 가야 함' },
  { value: 10000, label: '10km', desc: '먼 길도 마다 않는 전기차주' },
]

const OPERATOR_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  ME: { border: 'border-l-green-500', bg: 'bg-green-500', text: 'text-green-400' },
  HE: { border: 'border-l-blue-500', bg: 'bg-blue-500', text: 'text-blue-400' },
  PI: { border: 'border-l-purple-500', bg: 'bg-purple-500', text: 'text-purple-400' },
  KP: { border: 'border-l-sky-500', bg: 'bg-sky-500', text: 'text-sky-400' },
  SK: { border: 'border-l-red-500', bg: 'bg-red-500', text: 'text-red-400' },
  SF: { border: 'border-l-red-500', bg: 'bg-red-500', text: 'text-red-400' },
  EV: { border: 'border-l-teal-500', bg: 'bg-teal-500', text: 'text-teal-400' },
  GN: { border: 'border-l-sky-500', bg: 'bg-sky-500', text: 'text-sky-400' },
  HD: { border: 'border-l-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-400' },
}

const DEFAULT_COLOR = { border: 'border-l-slate-500', bg: 'bg-slate-500', text: 'text-slate-400' }

const LOADING_MESSAGES = [
  '환경부 서버에 물어보는 중...',
  '충전소 사장님들한테 가격 물어보는 중...',
  '배터리 잔량 걱정하는 중...',
  '최저가 충전소를 찾아 삼만리...',
  '전기요금 비교하느라 머리 아픈 중...',
]

const DEFAULT_LOCATION = {
  lat: 37.5665,
  lng: 126.978,
  label: '서울시청',
}

function getStatusColor(status: string): string {
  switch (status) {
    case '2':
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    case '3':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    case '1':
    case '4':
    case '5':
    case '9':
      return 'text-rose-400 bg-rose-500/20 border-rose-500/30'
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
  }
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function getDriveTime(meters: number): string {
  if (meters <= 300) return '바로 앞'
  if (meters <= 700) return '도보 5분'
  if (meters <= 1000) return '차로 ~2분'
  if (meters <= 2000) return '차로 ~4분'
  if (meters <= 3000) return '차로 ~6분'
  if (meters <= 5000) return '차로 ~10분'
  return '차로 15분+'
}

function getPriceReaction(price: number): string {
  if (price <= 280) return '헐... 이 단가 실화??? 사장님 혹시 자선사업가?'
  if (price <= 310) return '오 괜찮은데? 양심적인 단가~'
  if (price <= 340) return '음... 뭐 그냥 평범한 단가'
  if (price <= 370) return '좀 비싸긴 한데... 급속이니까 참을만...'
  return 'kWh당 이 가격이면 주유소가 더 싸겠다!!!'
}

function getChargeCostEstimate(pricePerKwh: number): string {
  // 60kWh battery, 20%→80% charge = ~36kWh
  const cost = Math.round(pricePerKwh * 36)
  return `약 ${cost.toLocaleString()}원 (20→80% 기준)`
}

function getNaverMapUrl(name: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name + ' 전기차 충전소')}`
}

function getKakaoMapUrl(name: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(name + ' 전기차 충전소')}`
}

function getTmapUrl(name: string): string {
  return `tmap://search?name=${encodeURIComponent(name + ' 전기차 충전소')}`
}

// ─── Main Page ─────────────────────────────────────────────────
export default function EvFinderPage() {
  const [chargerFilter, setChargerFilter] = useState('all')
  const [radius, setRadius] = useState(3000)
  const [sort, setSort] = useState('1')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION.label)
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...')
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [searched, setSearched] = useState(false)
  const [locationSource, setLocationSource] = useState<LocationSource>('fallback')

  const sharePath = `/ev-finder?charger=${chargerFilter}&radius=${radius}&sort=${sort}`

  useEffect(() => {
    trackPageView('/ev-finder', { pageType: 'ev-finder' })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const presetCharger = params.get('charger')
    if (presetCharger && CHARGER_FILTERS.some((f) => f.code === presetCharger)) {
      setChargerFilter(presetCharger)
    }

    const presetRadius = Number(params.get('radius'))
    if (RADIUS_OPTIONS.some((o) => o.value === presetRadius)) {
      setRadius(presetRadius)
    }

    const presetSort = params.get('sort')
    if (presetSort === '1' || presetSort === '2') {
      setSort(presetSort)
    }

    const rawLat = params.get('lat')
    const rawLng = params.get('lng')
    const presetLat = rawLat != null ? Number(rawLat) : NaN
    const presetLng = rawLng != null ? Number(rawLng) : NaN
    const presetLabel = params.get('label') || DEFAULT_LOCATION.label

    if (rawLat != null && rawLng != null && !Number.isNaN(presetLat) && !Number.isNaN(presetLng)) {
      setLocation({ lat: presetLat, lng: presetLng })
      setLocationLabel(presetLabel)
      setLocationStatus(`${presetLabel} 기준으로 검색합니다`)
      setLocationSource('preset')
      return
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setLocationLabel('현재 위치')
          setLocationStatus(
            `현재 위치 확인됨 (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          )
          setLocationSource('geolocation')
        },
        () => {
          setLocation({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng })
          setLocationLabel(DEFAULT_LOCATION.label)
          setLocationStatus(`위치 확인 실패 \u2192 ${DEFAULT_LOCATION.label} 기준으로 검색합니다`)
          setLocationSource('fallback')
        },
      )
    } else {
      setLocation({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng })
      setLocationLabel(DEFAULT_LOCATION.label)
      setLocationStatus(`위치 기능 미지원 \u2192 ${DEFAULT_LOCATION.label} 기준으로 검색합니다`)
      setLocationSource('fallback')
    }
  }, [])

  const handleSearch = async () => {
    if (!location) return

    setLoading(true)
    setError(null)
    setStations([])
    setSearched(false)
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)])
    trackEvent('search_executed', '/ev-finder', {
      charger: chargerFilter,
      radius,
      sort,
      locationSource,
    })

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError('오프라인 상태입니다. 인터넷 연결을 확인해주세요.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        `/api/ev?lat=${location.lat}&lng=${location.lng}&radius=${radius}&charger=${chargerFilter}&sort=${sort}`,
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '알 수 없는 오류가 발생했습니다')
        return
      }

      setStations(data.stations || [])
      setSearched(true)
    } catch {
      setError('네트워크 오류... 인터넷 연결을 확인해주세요!')
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (provider: 'naver' | 'kakao' | 'tmap', station: Station, rank: number) => {
    trackEvent('map_click', '/ev-finder', {
      provider,
      stationId: station.id,
      stationName: station.name,
      rank,
      charger: chargerFilter,
    })
  }

  const cheapestStation = stations.length > 0
    ? stations.reduce((best, s) => (s.minPrice < best.minPrice ? s : best))
    : null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </a>
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, -10, 10, -5, 0] }} transition={{ duration: 0.6, delay: 0.3 }}>
              <BatteryCharging className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              충전소 헌터
            </h1>
          </div>
          <p className="mt-3 text-slate-400 text-lg">
            전기차 배터리는 비어가고... 충전요금은 제각각이라
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/30 bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              환경부 API 기반 충전소 검색 + 요금 비교
            </div>
            <ServiceShareButton path={sharePath} eventPath="/ev-finder" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ── Search Panel ─────────────────────────────────── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8">
          {/* Charger Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              충전 타입
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CHARGER_FILTERS.map((f) => (
                <motion.button
                  key={f.code}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChargerFilter(f.code)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    chargerFilter === f.code
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f.emoji} {f.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Radius & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">반경</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({r.desc})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">정렬</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1">거리순 (가까운 거 먼저!)</option>
                <option value="2">가격순 (싼 거 먼저!)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{locationStatus}</span>
          </div>

          {/* Search Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={loading || !location}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingMessage}
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                충전소 찾기 GO GO GO
              </>
            )}
          </motion.button>
        </div>

        {/* ── Error ──────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-950/50 border border-rose-800 rounded-xl p-4 mb-8 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-rose-300">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ────────────────────────────────── */}
        {searched && !loading && stations.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-slate-500"
          >
            <Battery className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">주변에 충전소가 없습니다...</p>
            <p className="text-sm mt-2">반경을 넓혀보세요!</p>
          </motion.div>
        )}

        {/* ── Results ────────────────────────────────────── */}
        {stations.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="text-slate-400 text-sm">
                  총 <span className="text-white font-bold">{stations.length}</span>개
                  충전소 발견
                </span>
                {cheapestStation && (
                  <p className="mt-1 text-xs text-emerald-400">
                    최저 단가 {cheapestStation.minPrice.toFixed(1)}원/kWh ({cheapestStation.name})
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 30분마다 갱신
              </span>
            </motion.div>

            <div className="space-y-3 mb-8">
              {stations.map((station, index) => {
                const operatorColor = OPERATOR_COLORS[station.operatorId] || DEFAULT_COLOR
                const reaction = getPriceReaction(station.minPrice)
                const isFirst = index === 0
                const driveTime = getDriveTime(station.distance)
                const costEstimate = getChargeCostEstimate(station.minPrice)

                return (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: index * 0.08,
                      type: 'spring',
                      stiffness: 120,
                      damping: 14,
                    }}
                    className={`
                      relative rounded-xl border-l-4 overflow-hidden
                      ${operatorColor.border}
                      ${isFirst
                        ? 'bg-slate-900 border border-emerald-800/50'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                      }
                      transition-colors
                    `}
                  >
                    <div className="p-4 relative z-20">
                      {/* Top: rank + availability + drive time */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isFirst && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                            >
                              {'\u{1F451}'} {sort === '2' ? '최저 단가' : '가장 가까운'}
                            </motion.span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
                              station.availableCount > 0
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {station.availableCount > 0
                              ? `${station.availableCount}/${station.totalCount} 사용가능`
                              : '사용불가'}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${operatorColor.bg}`} />
                          <span className={`text-xs font-medium ${operatorColor.text}`}>
                            {station.operator}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            {station.rank}<span className="text-slate-600">/{stations.length}</span>
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{driveTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Station name + price */}
                      <div className="flex items-end justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-lg truncate">
                            {station.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate mt-1">{station.addr}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-3xl font-black ${isFirst ? 'text-emerald-400' : 'text-white'}`}>
                            {station.minPrice.toFixed(1)}
                          </span>
                          <span className={`text-sm font-medium ${isFirst ? 'text-emerald-500' : 'text-slate-400'}`}>
                            원/kWh
                          </span>
                        </div>
                      </div>

                      {/* Charger info badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {station.fastCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Zap className="w-3 h-3" />
                            급속 {station.fastCount}대 ({station.maxOutput}kW)
                          </span>
                        )}
                        {station.slowCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            <Battery className="w-3 h-3" />
                            완속 {station.slowCount}대
                          </span>
                        )}
                        {station.parkingFree && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            <CircleParking className="w-3 h-3" />
                            무료주차
                          </span>
                        )}
                        {station.limitYn && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            이용제한
                          </span>
                        )}
                      </div>

                      {/* Charger status detail */}
                      <div className="mb-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">
                          충전기 상태
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {station.chargers.slice(0, 8).map((charger, ci) => (
                            <span
                              key={ci}
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(charger.status)}`}
                            >
                              {charger.isFast ? '\u26A1' : '\u{1F50C}'} {charger.statusName}
                              {charger.output > 0 && ` ${charger.output}kW`}
                            </span>
                          ))}
                          {station.chargers.length > 8 && (
                            <span className="text-[10px] text-slate-500">
                              +{station.chargers.length - 8}대 더
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cost estimate */}
                      <div className="mb-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            예상 충전비용 (60kWh 기준)
                          </span>
                          <span className="text-xs text-emerald-400 font-semibold">
                            {costEstimate}
                          </span>
                        </div>
                      </div>

                      {/* Use time */}
                      <div className="mb-3 text-xs text-slate-500">
                        이용시간: {station.useTime}
                        {station.limitYn && station.limitDetail && (
                          <span className="text-rose-400 ml-2">({station.limitDetail})</span>
                        )}
                      </div>

                      {/* Bottom: reaction + distance + map */}
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-xs text-slate-500 italic truncate flex-1">
                          {reaction}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 shrink-0 lg:gap-3">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {formatDistance(station.distance)}
                          </span>
                          <a
                            href={getNaverMapUrl(station.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleMapClick('naver', station, station.rank)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            네이버
                          </a>
                          <a
                            href={getKakaoMapUrl(station.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleMapClick('kakao', station, station.rank)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            카카오
                          </a>
                          <a
                            href={getTmapUrl(station.name)}
                            onClick={() => handleMapClick('tmap', station, station.rank)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            티맵
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Pricing note */}
            <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-2">충전요금 안내</h3>
              <ul className="space-y-1 text-xs text-slate-500">
                <li>{'>'} 표시 요금은 사업자별 대표 요금 기준이며, 실제 요금은 회원 등급·시간대·할인 등에 따라 다를 수 있습니다.</li>
                <li>{'>'} 급속 충전(50kW 이상)과 완속 충전(7kW 이하)은 요금 체계가 다릅니다.</li>
                <li>{'>'} 환경부 충전소는 회원 가입 시 할인 혜택이 있을 수 있습니다.</li>
              </ul>
            </div>
          </>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="mt-12 border-t border-slate-800 pt-8 pb-12">
          <h3 className="text-slate-400 font-bold mb-4 flex items-center gap-2">
            <BatteryCharging className="w-4 h-4" />
            전기차 충전 꿀팁
          </h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>{'>'} 급속 충전은 80%까지만 충전하는 게 배터리에 좋습니다</li>
            <li>{'>'} 환경부 충전소 회원 가입하면 할인받을 수 있어요</li>
            <li>{'>'} 아파트 완속 충전이 가장 저렴합니다 (당연한 소리)</li>
          </ul>
          <p className="text-xs text-slate-600 mt-6">
            데이터 출처: 한국환경공단 전기차 충전소 API (data.go.kr)
          </p>
          <SiteFooter className="mt-6" />
        </footer>
      </main>
    </div>
  )
}
