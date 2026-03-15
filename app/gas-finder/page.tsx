'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fuel,
  Search,
  MapPin,
  Loader2,
  AlertTriangle,
  BarChart3,
  Navigation,
  ExternalLink,
  Trophy,
  Zap,
  Clock,
  TrendingDown,
  TrendingUp,
  ArrowLeft,
  House,
  Building2,
  Star,
  History,
  WifiOff,
} from 'lucide-react'
import { ServiceShareButton } from '@/components/service-share-button'
import { SiteFooter } from '@/components/site-footer'
import { trackEvent, trackPageView } from '@/lib/analytics-client'

// ─── Types ─────────────────────────────────────────────────────
interface Station {
  rank: number
  id: string
  name: string
  brand: string
  price: number
  distance: number
  history: StationHistoryPoint[]
  priceChange: number | null
}

interface AvgPrice {
  fuel: string
  name: string
  price: number
  diff: number
}

interface StationHistoryPoint {
  date: string
  price: number
}

type LocationSource = 'preset' | 'geolocation' | 'fallback' | 'saved'

interface SavedLocationRecord {
  slot: 'home' | 'work'
  label: string
  lat: number
  lng: number
  source: LocationSource
  savedAt: string
}

interface RecentSearchRecord {
  id: string
  label: string
  lat: number
  lng: number
  fuel: string
  radius: number
  sort: string
  locationSource: LocationSource
  createdAt: string
}

interface FavoriteStationRecord {
  key: string
  id: string
  name: string
  brand: string
  fuel: string
  price: number
  distance: number
  savedAt: string
}

interface PriceAlertRecord {
  id: string
  label: string
  lat: number
  lng: number
  fuel: string
  radius: number
  sort: string
  thresholdPrice: number
  locationSource: LocationSource
  createdAt: string
  lastTriggeredAt: string | null
  lastTriggeredPrice: number | null
}

interface CachedSearchSnapshot {
  id: string
  label: string
  lat: number
  lng: number
  fuel: string
  radius: number
  sort: string
  locationSource: LocationSource
  stations: Station[]
  cachedAt: string
}

interface CachedAverageSnapshot {
  averages: AvgPrice[]
  cachedAt: string
}

type AlertPermission = NotificationPermission | 'unsupported'

// ─── Constants ─────────────────────────────────────────────────
const FUEL_TYPES = [
  { code: 'B027', label: '휘발유', emoji: '\u26FD' },
  { code: 'D047', label: '경유', emoji: '\uD83D\uDE9B' },
  { code: 'B034', label: '고급유', emoji: '\uD83D\uDC8E' },
  { code: 'K015', label: 'LPG', emoji: '\uD83D\uDCA8' },
]

const FUEL_EMOJI: Record<string, string> = {
  B027: '\u26FD',
  D047: '\uD83D\uDE9B',
  B034: '\uD83D\uDC8E',
  K015: '\uD83D\uDCA8',
}

const RADIUS_OPTIONS = [
  { value: 1000, label: '1km', desc: '걸어갈 수 있는 거리' },
  { value: 2000, label: '2km', desc: '자전거 거리' },
  { value: 3000, label: '3km', desc: '적당적당' },
  { value: 5000, label: '5km', desc: '차 타고 가야 함' },
  { value: 10000, label: '10km', desc: '이쯤 되면 집착' },
]

const BRAND_NAMES: Record<string, string> = {
  SKE: 'SK에너지',
  GSC: 'GS칼텍스',
  HDO: '현대오일뱅크',
  SOL: 'S-OIL',
  NHO: '농협',
  RTE: '자영알뜰',
  RTX: '고속도로알뜰',
  ETC: '기타',
}

const BRAND_COMMENTS: Record<string, string> = {
  SKE: '행복이 가득한 SK~',
  GSC: 'I am your Energy!',
  HDO: '현.대.오.일.뱅.크.',
  SOL: '에쏘일~',
  NHO: '농협은 언제나 농심으로~',
  RTE: '이름없는 주유소의 반란!',
  RTX: '이름없는 주유소의 반란!',
}

const BRAND_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  SKE: { border: 'border-l-red-500', bg: 'bg-red-500', text: 'text-red-400' },
  GSC: { border: 'border-l-sky-500', bg: 'bg-sky-500', text: 'text-sky-400' },
  HDO: { border: 'border-l-orange-500', bg: 'bg-orange-500', text: 'text-orange-400' },
  SOL: { border: 'border-l-amber-400', bg: 'bg-amber-400', text: 'text-amber-400' },
  NHO: { border: 'border-l-lime-500', bg: 'bg-lime-500', text: 'text-lime-400' },
  RTE: { border: 'border-l-violet-500', bg: 'bg-violet-500', text: 'text-violet-400' },
  RTX: { border: 'border-l-violet-500', bg: 'bg-violet-500', text: 'text-violet-400' },
  ETC: { border: 'border-l-slate-500', bg: 'bg-slate-500', text: 'text-slate-400' },
}

const LOADING_MESSAGES = [
  '오피넷 서버에 물어보는 중...',
  '주유소 사장님들한테 가격 물어보는 중...',
  '지갑 사정을 고려하는 중...',
  '최저가를 찾아 삼만리...',
  '기름값 비교하느라 머리 아픈 중...',
]

const DEFAULT_LOCATION = {
  lat: 37.5665,
  lng: 126.978,
  label: '서울시청',
}

const STORAGE_KEYS = {
  savedLocations: 'gas-finder:saved-locations',
  recentSearches: 'gas-finder:recent-searches',
  cachedSearchSnapshots: 'gas-finder:cached-search-snapshots',
  averagePricesCache: 'gas-finder:average-prices-cache',
  favoriteStations: 'gas-finder:favorite-stations',
  priceAlerts: 'gas-finder:price-alerts',
  visitCount: 'gas-finder:visit-count',
} as const

const MAX_RECENT_SEARCHES = 5
const MAX_CACHED_SEARCH_SNAPSHOTS = 5
const MAX_FAVORITE_STATIONS = 8
const MAX_PRICE_ALERTS = 10

const SORT_LABELS: Record<string, string> = {
  '1': '가격순',
  '2': '거리순',
}

const LOCATION_SOURCE_LABELS: Record<LocationSource, string> = {
  preset: '프리셋 위치',
  geolocation: '현재 위치',
  fallback: '기본 위치',
  saved: '저장 위치',
}

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStoredJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage failures should not block the main search path.
  }
}

function getFuelLabel(fuelCode: string) {
  return FUEL_TYPES.find((item) => item.code === fuelCode)?.label || fuelCode
}

function getSortLabel(sort: string) {
  return SORT_LABELS[sort] || sort
}

function getLocationSourceLabel(source: LocationSource) {
  return LOCATION_SOURCE_LABELS[source]
}

function getSavedLocationSlotLabel(slot: SavedLocationRecord['slot']) {
  return slot === 'home' ? '집' : '회사'
}

function buildRecentSearchId(params: {
  lat: number
  lng: number
  fuel: string
  radius: number
  sort: string
}) {
  return [
    params.lat.toFixed(4),
    params.lng.toFixed(4),
    params.fuel,
    params.radius,
    params.sort,
  ].join(':')
}

function buildFavoriteStationKey(stationId: string, fuelCode: string) {
  return `${fuelCode}:${stationId}`
}

function buildPriceAlertId(params: {
  lat: number
  lng: number
  fuel: string
  radius: number
}) {
  return [
    params.lat.toFixed(4),
    params.lng.toFixed(4),
    params.fuel,
    params.radius,
  ].join(':')
}

// ─── Helpers ───────────────────────────────────────────────────
function getPriceReaction(price: number, fuelCode: string): string {
  switch (fuelCode) {
    case 'B027':
      if (price <= 1400) return '헐... 이 가격 실화??? 사장님 혹시 자선사업가?'
      if (price <= 1600) return '오 괜찮은데? 양심적이시네~'
      if (price <= 1800) return '음... 뭐 그냥 평범한 가격'
      if (price <= 2000) return '좀 비싸긴 한데... 참을만...'
      return '강도입니까???'
    case 'D047':
      if (price <= 1300) return '경유가 이 가격? 트럭기사님들 모여라!!!'
      if (price <= 1500) return '나쁘지 않은 가격~ 경유차 만세!'
      if (price <= 1700) return '흠... 그냥 그래'
      if (price <= 1900) return '디젤의 눈물이 흐른다...'
      return '차라리 자전거 타겠습니다'
    case 'B034':
      if (price <= 1600) return '고급유가 이 가격이면 거의 자선사업'
      if (price <= 1800) return '오 나쁘지 않아! 내 차는 고급유만 먹어'
      if (price <= 2000) return '고급유니까 좀 비싼 건 이해...'
      if (price <= 2200) return '고급유는 원래 비싸지만 이건 좀...'
      return '이 가격이면 금을 넣는 건가요???'
    case 'K015':
      if (price <= 800) return 'LPG 최고! 이래서 LPG 타는 거야~'
      if (price <= 1000) return '적당적당~ LPG 가성비 못 참지'
      if (price <= 1200) return 'LPG치고는 좀 비싸네?'
      if (price <= 1400) return 'LPG도 서민연료가 아닌건가...'
      return '이 가격이면 그냥 휘발유 넣고 말지!!!'
    default:
      return ''
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

function formatTrendDate(date: string): string {
  return date.length >= 10 ? date.slice(5).replace('-', '.') : date
}

function formatPriceDelta(delta: number | null): string {
  if (delta === null) return '비교 데이터 없음'
  if (delta === 0) return '전일과 동일'
  return `${delta > 0 ? '+' : ''}${delta.toLocaleString()}원`
}

function formatCacheTimestamp(date: string): string {
  try {
    return new Date(date).toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date
  }
}

function StationTrendPanel({
  history,
  priceChange,
}: {
  history: StationHistoryPoint[]
  priceChange: number | null
}) {
  if (history.length < 2) {
    return (
      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          최근 관측 추이
        </span>
        <span className="text-[11px] text-slate-500">수집 중</span>
      </div>
    )
  }

  const minPrice = Math.min(...history.map((point) => point.price))
  const maxPrice = Math.max(...history.map((point) => point.price))
  const range = Math.max(maxPrice - minPrice, 1)
  const lastPoint = history[history.length - 1]
  const firstPoint = history[0]
  const path = history
    .map((point, index) => {
      const x = history.length === 1 ? 6 : (index / (history.length - 1)) * 100
      const y = 28 - ((point.price - minPrice) / range) * 28
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const tone =
    priceChange === null ? 'slate' : priceChange < 0 ? 'emerald' : priceChange > 0 ? 'rose' : 'slate'
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : tone === 'rose'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        : 'border-slate-700 bg-slate-800/70 text-slate-300'

  return (
    <div className="mb-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            최근 관측 추이
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {formatTrendDate(firstPoint.date)} ~ {formatTrendDate(lastPoint.date)} · {history.length}일 관측
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${toneClass}`}>
          {formatPriceDelta(priceChange)}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <svg viewBox="0 0 100 28" className="h-8 flex-1 overflow-visible" aria-label="주유소 가격 추이">
          <path
            d={path}
            fill="none"
            stroke="rgb(34 197 94)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {history.map((point, index) => {
            const x = history.length === 1 ? 6 : (index / (history.length - 1)) * 100
            const y = 28 - ((point.price - minPrice) / range) * 28
            return (
              <circle
                key={`${point.date}-${point.price}`}
                cx={x}
                cy={y}
                r={index === history.length - 1 ? 2.5 : 1.8}
                fill={index === history.length - 1 ? 'rgb(16 185 129)' : 'rgb(100 116 139)'}
              >
                <title>{`${formatTrendDate(point.date)} ${point.price.toLocaleString()}원`}</title>
              </circle>
            )
          })}
        </svg>
        <div className="shrink-0 text-right text-[11px] text-slate-500">
          <div>최고 {maxPrice.toLocaleString()}</div>
          <div>최저 {minPrice.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

function getRankBadge(
  rank: number,
): { emoji: string; label: string; gradient: string } | null {
  if (rank === 1)
    return { emoji: '\uD83D\uDC51', label: '갓 최저가', gradient: 'from-yellow-500 to-amber-500' }
  if (rank === 2)
    return { emoji: '\uD83E\uDD48', label: '2등', gradient: 'from-slate-300 to-slate-400' }
  if (rank === 3)
    return { emoji: '\uD83E\uDD49', label: '3등', gradient: 'from-amber-600 to-orange-700' }
  return null
}

function getNaverMapUrl(name: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name + ' 주유소')}`
}

function getKakaoMapUrl(name: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(name + ' 주유소')}`
}

function getTmapUrl(name: string): string {
  return `tmap://search?name=${encodeURIComponent(name + ' 주유소')}`
}

// ─── Animated Price ────────────────────────────────────────────
function AnimatedPrice({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 900
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.floor(value * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return <>{display.toLocaleString()}</>
}

// ─── Confetti Burst ────────────────────────────────────────────
function ConfettiBurst() {
  const colors = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#f97316']
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: '50%',
            top: '40%',
            backgroundColor: colors[i % colors.length],
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 250,
            y: (Math.random() - 0.5) * 150 - 30,
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ─── Savings Analysis ──────────────────────────────────────────
function SavingsAnalysis({ stations }: { stations: Station[] }) {
  if (stations.length < 2) return null

  const prices = stations.map((s) => s.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const savingsWon = (maxPrice - minPrice) * 50

  let savingsComment: string
  let savingsEmoji: string
  let savingsLevel: string
  if (savingsWon > 5000) {
    savingsComment = '싼 데 가세요. 기름값 아끼면 치킨값!!!'
    savingsEmoji = '\uD83C\uDF57'
    savingsLevel = '치킨 달성!'
  } else if (savingsWon > 2000) {
    savingsComment = '커피값 정도는 아낄 수 있네요~'
    savingsEmoji = '\u2615'
    savingsLevel = '커피 달성!'
  } else if (savingsWon > 500) {
    savingsComment = '뭐... 껌값 정도는 아낄 수 있음'
    savingsEmoji = '\uD83E\uDE9C'
    savingsLevel = '껌 달성...'
  } else {
    savingsComment = '걍 가까운 데 가세요. 차이 없음 ㅋㅋ'
    savingsEmoji = '\uD83E\uDD37'
    savingsLevel = '의미없음'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden"
    >
      {savingsWon > 5000 && <ConfettiBurst />}

      <h3 className="text-lg font-bold mb-5 flex items-center gap-2 relative z-20">
        <Trophy className="w-5 h-5 text-amber-400" />
        가격 분석 리포트{' '}
        <span className="text-sm font-normal text-slate-500">(매우 진지)</span>
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-5 relative z-20">
        <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl">{'\uD83D\uDCC9'}</div>
          <div className="text-xl md:text-2xl font-black text-emerald-400 mt-1">
            <AnimatedPrice value={minPrice} delay={400} />
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">최저가</div>
        </div>
        <div className="bg-rose-950/50 border border-rose-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl">{'\uD83D\uDCC8'}</div>
          <div className="text-xl md:text-2xl font-black text-rose-400 mt-1">
            <AnimatedPrice value={maxPrice} delay={400} />
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-rose-500 mt-1">최고가</div>
        </div>
        <div className="bg-amber-950/50 border border-amber-800/50 rounded-xl p-4 text-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={savingsWon > 2000 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-2xl"
          >
            {savingsEmoji}
          </motion.div>
          <div className="text-xl md:text-2xl font-black text-amber-400 mt-1">
            <AnimatedPrice value={savingsWon} delay={600} />
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-amber-500 mt-1">50L 절약 ({savingsLevel})</div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-slate-400 text-center relative z-20"
      >
        {savingsComment}
      </motion.p>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function GasFinderPage() {
  const [fuel, setFuel] = useState('B027')
  const [radius, setRadius] = useState(2000)
  const [sort, setSort] = useState('1')
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION.label)
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...')
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [searched, setSearched] = useState(false)
  const [averages, setAverages] = useState<AvgPrice[]>([])
  const [averageResultSource, setAverageResultSource] = useState<'live' | 'cache' | null>(null)
  const [averageCacheMeta, setAverageCacheMeta] = useState<CachedAverageSnapshot | null>(null)
  const [locationSource, setLocationSource] = useState<LocationSource>('fallback')
  const [savedLocations, setSavedLocations] = useState<SavedLocationRecord[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearchRecord[]>([])
  const [cachedSearchSnapshots, setCachedSearchSnapshots] = useState<CachedSearchSnapshot[]>([])
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStationRecord[]>([])
  const [priceAlerts, setPriceAlerts] = useState<PriceAlertRecord[]>([])
  const [alertDraftPrice, setAlertDraftPrice] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<AlertPermission>('unsupported')
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlertRecord[]>([])
  const [isReturningVisitor, setIsReturningVisitor] = useState(false)
  const [searchResultSource, setSearchResultSource] = useState<'live' | 'cache' | null>(null)
  const [cachedResultMeta, setCachedResultMeta] = useState<CachedSearchSnapshot | null>(null)

  const sharePath = `/gas-finder?fuel=${fuel}&radius=${radius}&sort=${sort}`

  useEffect(() => {
    const saved = readStoredJson<SavedLocationRecord[]>(STORAGE_KEYS.savedLocations, [])
    const recent = readStoredJson<RecentSearchRecord[]>(STORAGE_KEYS.recentSearches, [])
    const cachedSnapshots = readStoredJson<CachedSearchSnapshot[]>(
      STORAGE_KEYS.cachedSearchSnapshots,
      [],
    )
    const favorites = readStoredJson<FavoriteStationRecord[]>(
      STORAGE_KEYS.favoriteStations,
      [],
    )
    const alerts = readStoredJson<PriceAlertRecord[]>(STORAGE_KEYS.priceAlerts, [])
    const params = new URLSearchParams(window.location.search)
    const currentVisitCount = Number(window.localStorage.getItem(STORAGE_KEYS.visitCount) || '0')
    const repeatVisit = currentVisitCount > 0

    setSavedLocations(saved)
    setRecentSearches(recent)
    setCachedSearchSnapshots(cachedSnapshots)
    setFavoriteStations(favorites)
    setPriceAlerts(alerts)
    setIsReturningVisitor(repeatVisit)
    setNotificationPermission('Notification' in window ? window.Notification.permission : 'unsupported')

    window.localStorage.setItem(STORAGE_KEYS.visitCount, String(currentVisitCount + 1))
    trackPageView('/gas-finder', {
      pageType: 'finder',
      preset: params.get('preset') || null,
      repeatVisit,
    })
  }, [])

  // Apply preset location when the page is opened from an intent landing.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const presetFuel = params.get('fuel')
    if (presetFuel && FUEL_TYPES.some((item) => item.code === presetFuel)) {
      setFuel(presetFuel)
    }

    const presetRadius = Number(params.get('radius'))
    if (RADIUS_OPTIONS.some((option) => option.value === presetRadius)) {
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
    const presetKey = params.get('preset') || 'query'
    const shortcut = params.get('shortcut')

    if (shortcut) {
      trackEvent('pwa_shortcut_opened', '/gas-finder', {
        shortcut,
      })
    }

    if (rawLat != null && rawLng != null && !Number.isNaN(presetLat) && !Number.isNaN(presetLng)) {
      setLocation({ lat: presetLat, lng: presetLng })
      setLocationLabel(presetLabel)
      setLocationStatus(`${presetLabel} 기준으로 검색합니다`)
      setLocationSource('preset')
      trackEvent('preset_location_loaded', '/gas-finder', {
        preset: presetKey,
        label: presetLabel,
      })
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

  // Fetch averages on mount
  useEffect(() => {
    const cachedAverage = readStoredJson<CachedAverageSnapshot | null>(
      STORAGE_KEYS.averagePricesCache,
      null,
    )

    const restoreCachedAverage = (reason: 'offline' | 'network-error') => {
      if (!cachedAverage || cachedAverage.averages.length === 0) return false

      setAverages(cachedAverage.averages)
      setAverageResultSource('cache')
      setAverageCacheMeta(cachedAverage)
      trackEvent('average_cache_loaded', '/gas-finder', {
        reason,
      })
      return true
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      restoreCachedAverage('offline')
      return
    }

    fetch('/api/gas/average')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          throw new Error(data.error || 'average fetch failed')
        }
        return data
      })
      .then((data) => {
        if (data.averages) {
          const snapshot = {
            averages: data.averages,
            cachedAt: new Date().toISOString(),
          }
          setAverages(data.averages)
          setAverageResultSource('live')
          setAverageCacheMeta(snapshot)
          writeStoredJson(STORAGE_KEYS.averagePricesCache, snapshot)
        }
      })
      .catch(() => {
        restoreCachedAverage('network-error')
      })
  }, [])

  useEffect(() => {
    if (!searched || loading || error) return

    trackEvent(stations.length > 0 ? 'results_rendered' : 'results_empty', '/gas-finder', {
      fuel,
      radius,
      sort,
      count: stations.length,
      locationSource,
      repeatVisit: isReturningVisitor,
    })
  }, [error, fuel, isReturningVisitor, loading, locationSource, radius, searched, sort, stations.length])

  const persistSavedLocations = (next: SavedLocationRecord[]) => {
    writeStoredJson(STORAGE_KEYS.savedLocations, next)
    setSavedLocations(next)
  }

  const persistRecentSearches = (next: RecentSearchRecord[]) => {
    writeStoredJson(STORAGE_KEYS.recentSearches, next)
    setRecentSearches(next)
  }

  const persistCachedSearchSnapshots = (next: CachedSearchSnapshot[]) => {
    writeStoredJson(STORAGE_KEYS.cachedSearchSnapshots, next)
    setCachedSearchSnapshots(next)
  }

  const persistFavoriteStations = (next: FavoriteStationRecord[]) => {
    writeStoredJson(STORAGE_KEYS.favoriteStations, next)
    setFavoriteStations(next)
  }

  const persistPriceAlerts = (next: PriceAlertRecord[]) => {
    writeStoredJson(STORAGE_KEYS.priceAlerts, next)
    setPriceAlerts(next)
  }

  const requestAlertPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported')
      return
    }

    const permission = await window.Notification.requestPermission()
    setNotificationPermission(permission)
    trackEvent('price_alert_permission_updated', '/gas-finder', {
      permission,
    })
  }

  const saveCurrentLocation = (slot: SavedLocationRecord['slot']) => {
    if (!location) return

    const nextRecord: SavedLocationRecord = {
      slot,
      label: locationLabel,
      lat: location.lat,
      lng: location.lng,
      source: locationSource,
      savedAt: new Date().toISOString(),
    }

    const next = [nextRecord, ...savedLocations.filter((item) => item.slot !== slot)].sort((a, b) =>
      a.slot.localeCompare(b.slot),
    )

    persistSavedLocations(next)
    trackEvent('saved_location', '/gas-finder', {
      slot,
      source: locationSource,
    })
    setLocationStatus(`${getSavedLocationSlotLabel(slot)} 위치를 저장했습니다`)
  }

  const persistRecentSearch = (params: {
    location: { lat: number; lng: number }
    locationLabel: string
    fuel: string
    radius: number
    sort: string
    locationSource: LocationSource
  }) => {
    const nextRecord: RecentSearchRecord = {
      id: buildRecentSearchId({
        lat: params.location.lat,
        lng: params.location.lng,
        fuel: params.fuel,
        radius: params.radius,
        sort: params.sort,
      }),
      label: params.locationLabel,
      lat: params.location.lat,
      lng: params.location.lng,
      fuel: params.fuel,
      radius: params.radius,
      sort: params.sort,
      locationSource: params.locationSource,
      createdAt: new Date().toISOString(),
    }

    const next = [
      nextRecord,
      ...recentSearches.filter((item) => item.id !== nextRecord.id),
    ].slice(0, MAX_RECENT_SEARCHES)

    persistRecentSearches(next)
  }

  const saveCachedSearchSnapshot = (
    params: {
      location: { lat: number; lng: number }
      locationLabel: string
      fuel: string
      radius: number
      sort: string
      locationSource: LocationSource
    },
    nextStations: Station[],
  ) => {
    if (nextStations.length === 0) return

    const snapshot: CachedSearchSnapshot = {
      id: buildRecentSearchId({
        lat: params.location.lat,
        lng: params.location.lng,
        fuel: params.fuel,
        radius: params.radius,
        sort: params.sort,
      }),
      label: params.locationLabel,
      lat: params.location.lat,
      lng: params.location.lng,
      fuel: params.fuel,
      radius: params.radius,
      sort: params.sort,
      locationSource: params.locationSource,
      stations: nextStations,
      cachedAt: new Date().toISOString(),
    }

    const next = [snapshot, ...cachedSearchSnapshots.filter((item) => item.id !== snapshot.id)].slice(
      0,
      MAX_CACHED_SEARCH_SNAPSHOTS,
    )

    persistCachedSearchSnapshots(next)
  }

  const restoreCachedSearchSnapshot = (
    snapshot: CachedSearchSnapshot,
    reason: 'offline' | 'network-error' | 'server-error',
  ) => {
    setStations(snapshot.stations)
    setSearched(true)
    setError(null)
    setSearchResultSource('cache')
    setCachedResultMeta(snapshot)
    setLocationStatus(
      reason === 'offline'
        ? `${snapshot.label} 저장 결과를 오프라인에서 불러왔습니다`
        : `${snapshot.label} 저장 결과를 네트워크 대신 불러왔습니다`,
    )
    trackEvent('cached_search_loaded', '/gas-finder', {
      reason,
      fuel: snapshot.fuel,
      radius: snapshot.radius,
      locationSource: snapshot.locationSource,
    })
  }

  const performSearch = async (params: {
    location: { lat: number; lng: number }
    locationLabel: string
    fuel: string
    radius: number
    sort: string
    locationSource: LocationSource
    brandFilterCount: number
  }) => {
    const searchId = buildRecentSearchId({
      lat: params.location.lat,
      lng: params.location.lng,
      fuel: params.fuel,
      radius: params.radius,
      sort: params.sort,
    })
    const cachedSnapshot =
      cachedSearchSnapshots.find((item) => item.id === searchId) ||
      readStoredJson<CachedSearchSnapshot[]>(STORAGE_KEYS.cachedSearchSnapshots, []).find(
        (item) => item.id === searchId,
      ) ||
      null

    setLoading(true)
    setError(null)
    setStations([])
    setSearched(false)
    setSearchResultSource(null)
    setCachedResultMeta(null)
    setLoadingMessage(
      LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    )
    trackEvent('search_executed', '/gas-finder', {
      fuel: params.fuel,
      radius: params.radius,
      sort: params.sort,
      locationSource: params.locationSource,
      brandFilterCount: params.brandFilterCount,
      repeatVisit: isReturningVisitor,
    })

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (cachedSnapshot) {
        restoreCachedSearchSnapshot(cachedSnapshot, 'offline')
      } else {
        setError('오프라인 상태입니다. 저장된 검색 결과가 있을 때만 다시 볼 수 있습니다.')
      }
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        `/api/gas?lat=${params.location.lat}&lng=${params.location.lng}&fuel=${params.fuel}&radius=${params.radius}&sort=${params.sort}`,
      )
      const data = await res.json()

      if (!res.ok) {
        if (cachedSnapshot && res.status >= 500) {
          restoreCachedSearchSnapshot(cachedSnapshot, 'server-error')
          return
        }
        setError(data.error || '알 수 없는 오류가 발생했습니다')
        return
      }

      const nextStations = data.stations || []

      setStations(nextStations)
      setSearched(true)
      setSearchResultSource('live')
      persistRecentSearch(params)
      saveCachedSearchSnapshot(params, nextStations)
    } catch {
      if (cachedSnapshot) {
        restoreCachedSearchSnapshot(cachedSnapshot, 'network-error')
      } else {
        setError('네트워크 오류... 인터넷 연결을 확인해주세요!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!location) return

    await performSearch({
      location,
      locationLabel,
      fuel,
      radius,
      sort,
      locationSource,
      brandFilterCount: selectedBrands.size,
    })
  }

  const applyRecentSearch = (item: RecentSearchRecord) => {
    const nextLocation = { lat: item.lat, lng: item.lng }
    setSelectedBrands(new Set())
    setFuel(item.fuel)
    setRadius(item.radius)
    setSort(item.sort)
    setLocation(nextLocation)
    setLocationLabel(item.label)
    setLocationSource(item.locationSource)
    setLocationStatus(`${item.label} 최근 검색을 불러왔습니다`)
    trackEvent('recent_search_loaded', '/gas-finder', {
      fuel: item.fuel,
      radius: item.radius,
      sort: item.sort,
      locationSource: item.locationSource,
    })

    void performSearch({
      location: nextLocation,
      locationLabel: item.label,
      fuel: item.fuel,
      radius: item.radius,
      sort: item.sort,
      locationSource: item.locationSource,
      brandFilterCount: 0,
    })
  }

  const applySavedLocation = (item: SavedLocationRecord) => {
    const slotLabel = getSavedLocationSlotLabel(item.slot)
    const nextLocation = { lat: item.lat, lng: item.lng }

    setLocation(nextLocation)
    setLocationLabel(slotLabel)
    setLocationSource('saved')
    setLocationStatus(`${slotLabel} 저장 위치를 불러왔습니다 (${item.label})`)
    trackEvent('saved_location_loaded', '/gas-finder', {
      slot: item.slot,
    })

    void performSearch({
      location: nextLocation,
      locationLabel: slotLabel,
      fuel,
      radius,
      sort,
      locationSource: 'saved',
      brandFilterCount: selectedBrands.size,
    })
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) next.delete(brand)
      else next.add(brand)
      return next
    })
  }

  const toggleFavoriteStation = (station: Station) => {
    const key = buildFavoriteStationKey(station.id, fuel)
    const exists = favoriteStations.some((item) => item.key === key)

    const next = exists
      ? favoriteStations.filter((item) => item.key !== key)
      : [
          {
            key,
            id: station.id,
            name: station.name,
            brand: station.brand,
            fuel,
            price: station.price,
            distance: station.distance,
            savedAt: new Date().toISOString(),
          },
          ...favoriteStations.filter((item) => item.key !== key),
        ].slice(0, MAX_FAVORITE_STATIONS)

    persistFavoriteStations(next)
    trackEvent('favorite_station_toggled', '/gas-finder', {
      action: exists ? 'removed' : 'saved',
      brand: station.brand,
      fuel,
    })
  }

  const removeFavoriteStation = (item: FavoriteStationRecord) => {
    const next = favoriteStations.filter((favorite) => favorite.key !== item.key)
    persistFavoriteStations(next)
    trackEvent('favorite_station_toggled', '/gas-finder', {
      action: 'removed',
      brand: item.brand,
      fuel: item.fuel,
    })
  }

  const savePriceAlert = () => {
    if (!location) return

    const thresholdPrice = Number(alertDraftPrice)
    if (!Number.isFinite(thresholdPrice) || thresholdPrice <= 0) {
      setError('알림 가격은 1원 이상 숫자로 입력해주세요.')
      return
    }

    const nextAlert: PriceAlertRecord = {
      id: buildPriceAlertId({
        lat: location.lat,
        lng: location.lng,
        fuel,
        radius,
      }),
      label: locationLabel,
      lat: location.lat,
      lng: location.lng,
      fuel,
      radius,
      sort,
      thresholdPrice,
      locationSource,
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
      lastTriggeredPrice: null,
    }

    const next = [nextAlert, ...priceAlerts.filter((item) => item.id !== nextAlert.id)].slice(
      0,
      MAX_PRICE_ALERTS,
    )

    persistPriceAlerts(next)
    setError(null)
    trackEvent('price_alert_saved', '/gas-finder', {
      fuel,
      radius,
      locationSource,
      permission: notificationPermission,
    })
  }

  const deletePriceAlert = (item: PriceAlertRecord) => {
    const next = priceAlerts.filter((alert) => alert.id !== item.id)
    persistPriceAlerts(next)
    trackEvent('price_alert_deleted', '/gas-finder', {
      fuel: item.fuel,
      radius: item.radius,
      locationSource: item.locationSource,
    })
  }

  const applyPriceAlert = (item: PriceAlertRecord) => {
    const nextLocation = { lat: item.lat, lng: item.lng }
    setSelectedBrands(new Set())
    setFuel(item.fuel)
    setRadius(item.radius)
    setSort(item.sort)
    setLocation(nextLocation)
    setLocationLabel(item.label)
    setLocationSource(item.locationSource)
    setLocationStatus(`${item.label} 알림 조건을 불러왔습니다`)

    void performSearch({
      location: nextLocation,
      locationLabel: item.label,
      fuel: item.fuel,
      radius: item.radius,
      sort: item.sort,
      locationSource: item.locationSource,
      brandFilterCount: 0,
    })
  }

  const isFavoriteStation = (station: Station) =>
    favoriteStations.some((item) => item.key === buildFavoriteStationKey(station.id, fuel))

  const cachedSearchSnapshotIds = new Set(cachedSearchSnapshots.map((item) => item.id))

  // Filter stations by selected brands
  const filteredStations =
    selectedBrands.size === 0
      ? stations
      : stations.filter((s) => selectedBrands.has(s.brand))

  const cheapestStationOverall =
    stations.length > 0
      ? stations.reduce((best, station) => (station.price < best.price ? station : best))
      : null
  const maxPrice = filteredStations.length > 0 ? Math.max(...filteredStations.map((s) => s.price)) : 0
  const cheapestPrice = filteredStations.length > 0 ? Math.min(...filteredStations.map((s) => s.price)) : 0
  const mostExpensivePrice = maxPrice
  const homeLocation = savedLocations.find((item) => item.slot === 'home')
  const workLocation = savedLocations.find((item) => item.slot === 'work')
  const currentPriceAlertId =
    location !== null
      ? buildPriceAlertId({
          lat: location.lat,
          lng: location.lng,
          fuel,
          radius,
        })
      : null
  const currentPriceAlert =
    currentPriceAlertId !== null
      ? priceAlerts.find((item) => item.id === currentPriceAlertId)
      : null

  useEffect(() => {
    if (!searched || cheapestStationOverall === null) return
    setAlertDraftPrice(String(Math.max(cheapestStationOverall.price - 20, 1)))
  }, [cheapestStationOverall, searched])

  useEffect(() => {
    if (!searched || loading || cheapestStationOverall === null || !location) return

    const currentAlertId = buildPriceAlertId({
      lat: location.lat,
      lng: location.lng,
      fuel,
      radius,
    })
    const now = new Date().toISOString()
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000
    const nextTriggeredAlerts: PriceAlertRecord[] = []
    let shouldPersist = false

    const nextAlerts = priceAlerts.map((alert) => {
      if (alert.id !== currentAlertId) return alert
      if (cheapestStationOverall.price > alert.thresholdPrice) return alert

      const alreadyTriggeredRecently =
        alert.lastTriggeredPrice === cheapestStationOverall.price &&
        alert.lastTriggeredAt !== null &&
        new Date(alert.lastTriggeredAt).getTime() >= sixHoursAgo

      if (alreadyTriggeredRecently) {
        nextTriggeredAlerts.push(alert)
        return alert
      }

      const updatedAlert = {
        ...alert,
        lastTriggeredAt: now,
        lastTriggeredPrice: cheapestStationOverall.price,
      }

      shouldPersist = true
      nextTriggeredAlerts.push(updatedAlert)
      return updatedAlert
    })

    if (nextTriggeredAlerts.length === 0) {
      setTriggeredAlerts([])
      return
    }

    setTriggeredAlerts(nextTriggeredAlerts)

    if (shouldPersist) {
      persistPriceAlerts(nextAlerts)
      trackEvent('price_alert_triggered', '/gas-finder', {
        fuel,
        radius,
        locationSource,
        permission: notificationPermission,
        channel: notificationPermission === 'granted' ? 'browser' : 'in-app',
      })

      if (notificationPermission === 'granted' && 'Notification' in window) {
        nextTriggeredAlerts.forEach((alert) => {
          const body = `${alert.label} 기준 ${getFuelLabel(alert.fuel)} 최저가가 ${cheapestStationOverall.price.toLocaleString()}원/L까지 내려왔습니다.`
          new window.Notification('기름값 알림 도착', { body })
        })
      }
    }
  }, [cheapestStationOverall, fuel, loading, location, locationSource, notificationPermission, priceAlerts, radius, searched])

  const handleMapClick = (
    provider: 'naver' | 'kakao' | 'tmap',
    station: Station,
    rank: number,
  ) => {
    trackEvent('map_click', '/gas-finder', {
      provider,
      stationId: station.id,
      stationName: station.name,
      rank,
      fuel,
    })
  }

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
              <Fuel className="w-10 h-10 text-rose-500" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              기름값 헌터
            </h1>
          </div>
          <p className="mt-3 text-slate-400 text-lg">
            월급은 통장을 스쳐가고... 기름값은 지갑을 관통한다
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/30 bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              오피넷 기반 가격 비교 + 지도 바로가기
            </div>
            <ServiceShareButton path={sharePath} eventPath="/gas-finder" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ── Average Prices ───────────────────────────────── */}
        {averages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                전국 평균 기름값
              </h2>
              {averageResultSource === 'cache' && averageCacheMeta ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
                  <WifiOff className="h-3.5 w-3.5" />
                  저장 시각 {formatCacheTimestamp(averageCacheMeta.cachedAt)}
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {averages.map((avg, i) => {
                const isDown = avg.diff < 0
                return (
                  <motion.div
                    key={avg.fuel}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"
                  >
                    <div className="text-lg mb-1">{FUEL_EMOJI[avg.fuel] || '\u26FD'}</div>
                    <div className="text-xs text-slate-500 mb-1">{avg.name}</div>
                    <div className="text-xl font-black text-white">
                      <AnimatedPrice value={Math.round(avg.price)} delay={i * 100} />
                      <span className="text-xs text-slate-400">원</span>
                    </div>
                    <div
                      className={`text-xs font-bold mt-1 flex items-center justify-center gap-0.5 ${
                        isDown ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isDown ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      {isDown ? '' : '+'}
                      {avg.diff.toFixed(2)}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Search Panel ─────────────────────────────────── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8">
          {/* Fuel Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              유종 선택
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FUEL_TYPES.map((f) => (
                <motion.button
                  key={f.code}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFuel(f.code)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    fuel === f.code
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="1">가격순 (싼 거 먼저!)</option>
                <option value="2">거리순 (가까운 거 먼저!)</option>
              </select>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              브랜드 필터 <span className="text-slate-600 font-normal">(선택 안 하면 전체)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BRAND_NAMES).map(([code, name]) => {
                const isSelected = selectedBrands.has(code)
                const color = BRAND_COLORS[code] || BRAND_COLORS.ETC
                return (
                  <motion.button
                    key={code}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleBrand(code)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? `${color.bg} text-white shadow-lg`
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : color.bg}`} />
                    {name}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{locationStatus}</span>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-2">
            {[
              { slot: 'home' as const, title: '집', icon: House, item: homeLocation },
              { slot: 'work' as const, title: '회사', icon: Building2, item: workLocation },
            ].map(({ slot, title, icon: SlotIcon, item }) => (
              <div
                key={slot}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <SlotIcon className="h-4 w-4 text-amber-300" />
                      {title}
                    </div>
                    {item ? (
                      <>
                        <p className="mt-2 truncate text-sm text-slate-300">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {getLocationSourceLabel(item.source)} 저장
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        아직 저장된 위치가 없습니다
                      </p>
                    )}
                  </div>
                  {item ? (
                    <button
                      type="button"
                      onClick={() => applySavedLocation(item)}
                      className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      불러오기
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => saveCurrentLocation(slot)}
                  disabled={!location}
                  className="mt-3 inline-flex items-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-50"
                >
                  현재 위치로 저장
                </button>
              </div>
            ))}
          </div>

          {/* Search Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={loading || !location}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingMessage}
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                싼 주유소 찾기 GO GO GO
              </>
            )}
          </motion.button>
        </div>

        {(recentSearches.length > 0 || favoriteStations.length > 0) && (
          <div className="grid gap-6 mb-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                <History className="h-4 w-4 text-sky-400" />
                최근 검색
              </h2>
              <div className="space-y-3">
                {recentSearches.length > 0 ? (
                  recentSearches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyRecentSearch(item)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left transition-colors hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-semibold text-white">{item.label}</div>
                            {cachedSearchSnapshotIds.has(item.id) ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                                <WifiOff className="h-3 w-3" />
                                오프라인 가능
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {getFuelLabel(item.fuel)} · {item.radius / 1000}km · {getSortLabel(item.sort)}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-sky-300">바로 검색</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">아직 저장된 최근 검색이 없습니다.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                <Star className="h-4 w-4 text-amber-300" />
                즐겨찾기 주유소
              </h2>
              <div className="space-y-3">
                {favoriteStations.length > 0 ? (
                  favoriteStations.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{item.name}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {BRAND_NAMES[item.brand] || item.brand} · {getFuelLabel(item.fuel)}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            최근 본 가격 {item.price.toLocaleString()}원/L · {formatDistance(item.distance)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFavoriteStation(item)}
                          className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:border-amber-400"
                        >
                          해제
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">아직 저장된 즐겨찾기 주유소가 없습니다.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {(searched && stations.length > 0) || priceAlerts.length > 0 ? (
          <div className="grid gap-6 mb-8 lg:grid-cols-[1.1fr_0.9fr]">
            {searched && stations.length > 0 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Zap className="h-4 w-4 text-amber-300" />
                  가격 알림 만들기
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  현재 검색 기준 최저가는 {cheapestStationOverall?.price.toLocaleString()}원/L입니다.
                  원하는 가격 이하가 나오면 다음 검색 때 바로 알려드립니다.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="number"
                    min="1"
                    value={alertDraftPrice}
                    onChange={(e) => setAlertDraftPrice(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="알림 가격 입력"
                  />
                  <button
                    type="button"
                    onClick={savePriceAlert}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20"
                  >
                    알림 저장
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: '현재 최저가', value: cheapestStationOverall?.price || 1 },
                    {
                      label: '최저가 -20원',
                      value: Math.max((cheapestStationOverall?.price || 1) - 20, 1),
                    },
                    {
                      label: '최저가 -50원',
                      value: Math.max((cheapestStationOverall?.price || 1) - 50, 1),
                    },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setAlertDraftPrice(String(option.value))}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">브라우저 알림 권한</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {notificationPermission === 'granted'
                          ? '브라우저 알림이 켜져 있습니다.'
                          : notificationPermission === 'denied'
                            ? '브라우저 알림이 차단되어 있어 인앱 알림만 동작합니다.'
                            : notificationPermission === 'unsupported'
                              ? '현재 브라우저는 알림을 지원하지 않습니다.'
                              : '권한을 허용하면 브라우저 알림도 같이 보낼 수 있습니다.'}
                      </div>
                    </div>
                    {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' ? (
                      <button
                        type="button"
                        onClick={() => void requestAlertPermission()}
                        className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-200 hover:border-amber-300"
                      >
                        알림 권한 요청
                      </button>
                    ) : null}
                  </div>
                </div>

                {currentPriceAlert ? (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    현재 조건에는 {currentPriceAlert.thresholdPrice.toLocaleString()}원/L 이하 알림이 저장돼 있습니다.
                  </div>
                ) : null}

                <p className="mt-4 text-xs text-slate-500">
                  알림은 현재 브라우저에만 저장됩니다. 다른 기기에서는 공유되지 않습니다.
                </p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                <History className="h-4 w-4 text-amber-300" />
                저장된 가격 알림
              </h2>
              <div className="space-y-3">
                {priceAlerts.length > 0 ? (
                  priceAlerts.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{item.label}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {getFuelLabel(item.fuel)} · {item.radius / 1000}km · {getSortLabel(item.sort)}
                          </div>
                          <div className="mt-2 text-xs text-amber-200">
                            {item.thresholdPrice.toLocaleString()}원/L 이하
                          </div>
                          {item.lastTriggeredAt ? (
                            <div className="mt-2 text-[11px] text-emerald-300">
                              최근 트리거 {new Date(item.lastTriggeredAt).toLocaleString('ko-KR')}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => applyPriceAlert(item)}
                            className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                          >
                            불러오기
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePriceAlert(item)}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">아직 저장된 가격 알림이 없습니다.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {triggeredAlerts.length > 0 && (
          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-100">
              <TrendingDown className="h-4 w-4" />
              가격 알림 도착
            </h2>
            <div className="mt-3 space-y-2 text-sm text-emerald-50">
              {triggeredAlerts.map((item) => (
                <p key={item.id}>
                  {item.label} 기준 {getFuelLabel(item.fuel)} 최저가가{' '}
                  {item.lastTriggeredPrice?.toLocaleString()}원/L까지 내려왔습니다.
                </p>
              ))}
            </div>
          </div>
        )}

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
            <Fuel className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">주변에 주유소가 없습니다...</p>
            <p className="text-sm mt-2">반경을 넓혀보세요!</p>
          </motion.div>
        )}

        {/* ── Results ────────────────────────────────────── */}
        {filteredStations.length > 0 && (
          <>
            {searchResultSource === 'cache' && cachedResultMeta ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                  <div>
                    <div className="text-sm font-semibold text-amber-100">
                      저장된 검색 결과를 보여주는 중입니다
                    </div>
                    <p className="mt-1 text-sm leading-6 text-amber-50/85">
                      {cachedResultMeta.label} 기준 {getFuelLabel(cachedResultMeta.fuel)} 결과를{' '}
                      {formatCacheTimestamp(cachedResultMeta.cachedAt)}에 저장한 스냅샷으로
                      불러왔습니다. 연결이 복구되면 다시 검색해 최신 가격으로 갱신하세요.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="text-slate-400 text-sm">
                  총 <span className="text-white font-bold">{filteredStations.length}</span>개
                  주유소 발견
                  {selectedBrands.size > 0 && (
                    <span className="text-slate-600"> (전체 {stations.length}개 중)</span>
                  )}
                </span>
                <p className="mt-1 text-[11px] text-slate-600">
                  일별 추이는 오피넷 원본 이력이 아니라 이 서비스가 최근에 관측한 가격 기준입니다.
                </p>
              </div>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 1시간마다 갱신
              </span>
            </motion.div>

            <div className="space-y-3 mb-8">
              {filteredStations.map((station, index) => {
                const badge = getRankBadge(index + 1)
                const priceRatio = maxPrice > 0 ? (station.price / maxPrice) * 100 : 100
                const brandName = BRAND_NAMES[station.brand] || station.brand
                const brandComment = BRAND_COMMENTS[station.brand] || ''
                const brandColor = BRAND_COLORS[station.brand] || BRAND_COLORS.ETC
                const reaction = getPriceReaction(station.price, fuel)
                const isFirst = index === 0
                const isCheapest = station.price === cheapestPrice
                const isMostExpensive = station.price === mostExpensivePrice && filteredStations.length > 1
                const driveTime = getDriveTime(station.distance)
                const favoriteStation = isFavoriteStation(station)

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
                      ${brandColor.border}
                      ${isFirst
                        ? 'bg-slate-900 border border-emerald-800/50 animate-glow'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                      }
                      transition-colors
                    `}
                  >
                    {isFirst && <ConfettiBurst />}

                    <div className="p-4 relative z-20">
                      {/* Top: badge + drive time */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: index * 0.08 + 0.2,
                                type: 'spring',
                                stiffness: 200,
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${badge.gradient} text-white shadow-lg`}
                            >
                              {badge.emoji} {badge.label}
                            </motion.span>
                          )}
                          {isCheapest && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <TrendingDown className="w-3 h-3" />
                              최저가
                            </span>
                          )}
                          {isMostExpensive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <TrendingUp className="w-3 h-3" />
                              최고가
                            </span>
                          )}
                          <span className={`w-2 h-2 rounded-full ${brandColor.bg}`} />
                          <span className={`text-xs font-medium ${brandColor.text}`}>
                            {brandName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            {index + 1}<span className="text-slate-600">/{filteredStations.length}등</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleFavoriteStation(station)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
                              favoriteStation
                                ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                                : 'border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-500 hover:text-white'
                            }`}
                          >
                            <Star className={`h-3 w-3 ${favoriteStation ? 'fill-current' : ''}`} />
                            {favoriteStation ? '저장됨' : '즐겨찾기'}
                          </button>
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
                          {brandComment && (
                            <span className="text-slate-600 italic text-xs">
                              &ldquo;{brandComment}&rdquo;
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-3xl font-black ${isFirst ? 'text-emerald-400' : 'text-white'}`}>
                            <AnimatedPrice value={station.price} delay={index * 80} />
                          </span>
                          <span className={`text-sm font-medium ${isFirst ? 'text-emerald-500' : 'text-slate-400'}`}>
                            원/L
                          </span>
                        </div>
                      </div>

                      {/* Price bar */}
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <motion.div
                          className={`h-full rounded-full ${
                            station.rank <= 3 ? 'bg-emerald-500' : 'bg-slate-600'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${priceRatio}%` }}
                          transition={{ duration: 1, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
                        />
                      </div>

                      <StationTrendPanel history={station.history} priceChange={station.priceChange} />

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
                            onClick={() => handleMapClick('naver', station, index + 1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            네이버
                          </a>
                          <a
                            href={getKakaoMapUrl(station.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleMapClick('kakao', station, index + 1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            카카오
                          </a>
                          <a
                            href={getTmapUrl(station.name)}
                            onClick={() => handleMapClick('tmap', station, index + 1)}
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

            {/* Savings Analysis */}
            <SavingsAnalysis stations={filteredStations} />
          </>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="mt-12 border-t border-slate-800 pt-8 pb-12">
          <h3 className="text-slate-400 font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            주유 꿀팁
          </h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>{'>'} 셀프 주유소가 보통 더 쌉니다 (당연한 소리)</li>
            <li>{'>'} 월요일에 기름값이 떨어진다는 건 도시전설입니다</li>
            <li>{'>'} 이 사이트 보는 데이터 요금이 더 나올 수도 있음</li>
          </ul>
          <p className="text-xs text-slate-600 mt-6">
            데이터 출처: 한국석유공사 오피넷 (opinet.co.kr)
          </p>
          <SiteFooter className="mt-6" />
        </footer>
      </main>
    </div>
  )
}
