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
  House,
  Building2,
  Star,
  History,
  Trophy,
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
  charger: string
  radius: number
  sort: string
  locationSource: LocationSource
  createdAt: string
}

interface FavoriteStationRecord {
  key: string
  id: string
  name: string
  operator: string
  operatorId: string
  charger: string
  minPrice: number
  distance: number
  savedAt: string
}

interface CachedSearchSnapshot {
  id: string
  label: string
  lat: number
  lng: number
  charger: string
  radius: number
  sort: string
  locationSource: LocationSource
  stations: Station[]
  cachedAt: string
}

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

const OPERATOR_NAMES: Record<string, string> = {
  ME: '환경부',
  HE: '한국전기차충전서비스',
  PI: '차지비',
  KP: '한국전력',
  GN: 'GS칼텍스',
  SK: 'SK시그넷',
  SF: 'SK에너지',
  EV: '에버온',
  HD: '현대자동차',
  TS: '테슬라',
}

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
  TS: { border: 'border-l-rose-500', bg: 'bg-rose-500', text: 'text-rose-400' },
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

const STORAGE_KEYS = {
  savedLocations: 'ev-finder:saved-locations',
  recentSearches: 'ev-finder:recent-searches',
  cachedSearchSnapshots: 'ev-finder:cached-search-snapshots',
  favoriteStations: 'ev-finder:favorite-stations',
  visitCount: 'ev-finder:visit-count',
} as const

const MAX_RECENT_SEARCHES = 5
const MAX_CACHED_SEARCH_SNAPSHOTS = 5
const MAX_FAVORITE_STATIONS = 8

const SORT_LABELS: Record<string, string> = {
  '1': '거리순',
  '2': '가격순',
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

function getChargerFilterLabel(code: string) {
  return CHARGER_FILTERS.find((f) => f.code === code)?.label || code
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
  charger: string
  radius: number
  sort: string
}) {
  return [
    params.lat.toFixed(4),
    params.lng.toFixed(4),
    params.charger,
    params.radius,
    params.sort,
  ].join(':')
}

function buildFavoriteStationKey(stationId: string, chargerFilter: string) {
  return `${chargerFilter}:${stationId}`
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

function getRankBadge(
  rank: number,
): { emoji: string; label: string; gradient: string } | null {
  if (rank === 1)
    return { emoji: '\uD83C\uDFC6', label: '1등', gradient: 'from-emerald-500 to-cyan-500' }
  if (rank === 2)
    return { emoji: '\uD83E\uDD48', label: '2등', gradient: 'from-slate-300 to-slate-400' }
  if (rank === 3)
    return { emoji: '\uD83E\uDD49', label: '3등', gradient: 'from-amber-600 to-orange-700' }
  return null
}

// ─── Animated Price ────────────────────────────────────────────
function AnimatedPrice({ value, delay = 0, decimals = 0 }: { value: number; delay?: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 900
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(value * eased)
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  if (decimals > 0) {
    return <>{display.toFixed(decimals)}</>
  }
  return <>{Math.floor(display).toLocaleString()}</>
}

// ─── Confetti Burst ────────────────────────────────────────────
function ConfettiBurst() {
  const colors = ['#10b981', '#06b6d4', '#22c55e', '#3b82f6', '#a855f7', '#f97316']
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

// ─── Savings Analysis (EV) ─────────────────────────────────────
function SavingsAnalysis({ stations }: { stations: Station[] }) {
  if (stations.length < 2) return null

  const prices = stations.map((s) => s.minPrice)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  // 36kWh charge (20%→80% of 60kWh battery)
  const savingsWon = Math.round((maxPrice - minPrice) * 36)

  let savingsComment: string
  let savingsEmoji: string
  let savingsLevel: string
  if (savingsWon > 5000) {
    savingsComment = '싼 데 가세요. 전기값 아끼면 치킨값!!!'
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
        <Trophy className="w-5 h-5 text-emerald-400" />
        충전 요금 분석 리포트{' '}
        <span className="text-sm font-normal text-slate-500">(매우 진지)</span>
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-5 relative z-20">
        <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl">{'\uD83D\uDCC9'}</div>
          <div className="text-xl md:text-2xl font-black text-emerald-400 mt-1">
            <AnimatedPrice value={minPrice} delay={400} decimals={1} />
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">최저 단가/kWh</div>
        </div>
        <div className="bg-rose-950/50 border border-rose-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl">{'\uD83D\uDCC8'}</div>
          <div className="text-xl md:text-2xl font-black text-rose-400 mt-1">
            <AnimatedPrice value={maxPrice} delay={400} decimals={1} />
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-rose-500 mt-1">최고 단가/kWh</div>
        </div>
        <div className="bg-cyan-950/50 border border-cyan-800/50 rounded-xl p-4 text-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={savingsWon > 2000 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-2xl"
          >
            {savingsEmoji}
          </motion.div>
          <div className="text-xl md:text-2xl font-black text-cyan-400 mt-1">
            <AnimatedPrice value={savingsWon} delay={600} />
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-cyan-500 mt-1">36kWh 절약 ({savingsLevel})</div>
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
export default function EvFinderPage() {
  const [chargerFilter, setChargerFilter] = useState('all')
  const [radius, setRadius] = useState(3000)
  const [sort, setSort] = useState('1')
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(new Set())
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION.label)
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...')
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [searched, setSearched] = useState(false)
  const [locationSource, setLocationSource] = useState<LocationSource>('fallback')
  const [savedLocations, setSavedLocations] = useState<SavedLocationRecord[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearchRecord[]>([])
  const [cachedSearchSnapshots, setCachedSearchSnapshots] = useState<CachedSearchSnapshot[]>([])
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStationRecord[]>([])
  const [isReturningVisitor, setIsReturningVisitor] = useState(false)
  const [searchResultSource, setSearchResultSource] = useState<'live' | 'cache' | null>(null)
  const [cachedResultMeta, setCachedResultMeta] = useState<CachedSearchSnapshot | null>(null)

  const sharePath = `/ev-finder?charger=${chargerFilter}&radius=${radius}&sort=${sort}`

  // ── Hydrate localStorage on mount ──
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
    const currentVisitCount = Number(window.localStorage.getItem(STORAGE_KEYS.visitCount) || '0')
    const repeatVisit = currentVisitCount > 0

    setSavedLocations(saved)
    setRecentSearches(recent)
    setCachedSearchSnapshots(cachedSnapshots)
    setFavoriteStations(favorites)
    setIsReturningVisitor(repeatVisit)

    window.localStorage.setItem(STORAGE_KEYS.visitCount, String(currentVisitCount + 1))
    const params = new URLSearchParams(window.location.search)
    trackPageView('/ev-finder', {
      pageType: 'ev-finder',
      preset: params.get('preset') || null,
      repeatVisit,
    })
  }, [])

  // ── URL presets + geolocation ──
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

  // ── Track results render ──
  useEffect(() => {
    if (!searched || loading || error) return

    trackEvent(stations.length > 0 ? 'results_rendered' : 'results_empty', '/ev-finder', {
      charger: chargerFilter,
      radius,
      sort,
      count: stations.length,
      locationSource,
      repeatVisit: isReturningVisitor,
    })
  }, [chargerFilter, error, isReturningVisitor, loading, locationSource, radius, searched, sort, stations.length])

  // ── Persist helpers ──
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
    trackEvent('saved_location', '/ev-finder', {
      slot,
      source: locationSource,
    })
    setLocationStatus(`${getSavedLocationSlotLabel(slot)} 위치를 저장했습니다`)
  }

  const persistRecentSearch = (params: {
    location: { lat: number; lng: number }
    locationLabel: string
    charger: string
    radius: number
    sort: string
    locationSource: LocationSource
  }) => {
    const nextRecord: RecentSearchRecord = {
      id: buildRecentSearchId({
        lat: params.location.lat,
        lng: params.location.lng,
        charger: params.charger,
        radius: params.radius,
        sort: params.sort,
      }),
      label: params.locationLabel,
      lat: params.location.lat,
      lng: params.location.lng,
      charger: params.charger,
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
      charger: string
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
        charger: params.charger,
        radius: params.radius,
        sort: params.sort,
      }),
      label: params.locationLabel,
      lat: params.location.lat,
      lng: params.location.lng,
      charger: params.charger,
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
    trackEvent('cached_search_loaded', '/ev-finder', {
      reason,
      charger: snapshot.charger,
      radius: snapshot.radius,
      locationSource: snapshot.locationSource,
    })
  }

  const performSearch = async (params: {
    location: { lat: number; lng: number }
    locationLabel: string
    charger: string
    radius: number
    sort: string
    locationSource: LocationSource
    operatorFilterCount: number
  }) => {
    const searchId = buildRecentSearchId({
      lat: params.location.lat,
      lng: params.location.lng,
      charger: params.charger,
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
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)])
    trackEvent('search_executed', '/ev-finder', {
      charger: params.charger,
      radius: params.radius,
      sort: params.sort,
      locationSource: params.locationSource,
      operatorFilterCount: params.operatorFilterCount,
      repeatVisit: isReturningVisitor,
      searchArea: params.locationLabel,
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
        `/api/ev?lat=${params.location.lat}&lng=${params.location.lng}&radius=${params.radius}&charger=${params.charger}&sort=${params.sort}`,
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
      charger: chargerFilter,
      radius,
      sort,
      locationSource,
      operatorFilterCount: selectedOperators.size,
    })
  }

  const applyRecentSearch = (item: RecentSearchRecord) => {
    const nextLocation = { lat: item.lat, lng: item.lng }
    setSelectedOperators(new Set())
    setChargerFilter(item.charger)
    setRadius(item.radius)
    setSort(item.sort)
    setLocation(nextLocation)
    setLocationLabel(item.label)
    setLocationSource(item.locationSource)
    setLocationStatus(`${item.label} 최근 검색을 불러왔습니다`)
    trackEvent('recent_search_loaded', '/ev-finder', {
      charger: item.charger,
      radius: item.radius,
      sort: item.sort,
      locationSource: item.locationSource,
    })

    void performSearch({
      location: nextLocation,
      locationLabel: item.label,
      charger: item.charger,
      radius: item.radius,
      sort: item.sort,
      locationSource: item.locationSource,
      operatorFilterCount: 0,
    })
  }

  const applySavedLocation = (item: SavedLocationRecord) => {
    const slotLabel = getSavedLocationSlotLabel(item.slot)
    const nextLocation = { lat: item.lat, lng: item.lng }

    setLocation(nextLocation)
    setLocationLabel(slotLabel)
    setLocationSource('saved')
    setLocationStatus(`${slotLabel} 저장 위치를 불러왔습니다 (${item.label})`)
    trackEvent('saved_location_loaded', '/ev-finder', {
      slot: item.slot,
    })

    void performSearch({
      location: nextLocation,
      locationLabel: slotLabel,
      charger: chargerFilter,
      radius,
      sort,
      locationSource: 'saved',
      operatorFilterCount: selectedOperators.size,
    })
  }

  const toggleOperator = (operatorId: string) => {
    setSelectedOperators((prev) => {
      const next = new Set(prev)
      if (next.has(operatorId)) next.delete(operatorId)
      else next.add(operatorId)
      return next
    })
  }

  const toggleFavoriteStation = (station: Station) => {
    const key = buildFavoriteStationKey(station.id, chargerFilter)
    const exists = favoriteStations.some((item) => item.key === key)

    const next = exists
      ? favoriteStations.filter((item) => item.key !== key)
      : [
          {
            key,
            id: station.id,
            name: station.name,
            operator: station.operator,
            operatorId: station.operatorId,
            charger: chargerFilter,
            minPrice: station.minPrice,
            distance: station.distance,
            savedAt: new Date().toISOString(),
          },
          ...favoriteStations.filter((item) => item.key !== key),
        ].slice(0, MAX_FAVORITE_STATIONS)

    persistFavoriteStations(next)
    trackEvent('favorite_station_toggled', '/ev-finder', {
      action: exists ? 'removed' : 'saved',
      operator: station.operatorId,
      charger: chargerFilter,
    })
  }

  const removeFavoriteStation = (item: FavoriteStationRecord) => {
    const next = favoriteStations.filter((favorite) => favorite.key !== item.key)
    persistFavoriteStations(next)
    trackEvent('favorite_station_toggled', '/ev-finder', {
      action: 'removed',
      operator: item.operatorId,
      charger: item.charger,
    })
  }

  const isFavoriteStation = (station: Station) =>
    favoriteStations.some((item) => item.key === buildFavoriteStationKey(station.id, chargerFilter))

  const cachedSearchSnapshotIds = new Set(cachedSearchSnapshots.map((item) => item.id))

  // Filter stations by selected operators
  const filteredStations =
    selectedOperators.size === 0
      ? stations
      : stations.filter((s) => selectedOperators.has(s.operatorId))

  const cheapestStation = filteredStations.length > 0
    ? filteredStations.reduce((best, s) => (s.minPrice < best.minPrice ? s : best))
    : null

  const homeLocation = savedLocations.find((item) => item.slot === 'home')
  const workLocation = savedLocations.find((item) => item.slot === 'work')

  const handleMapClick = (provider: 'naver' | 'kakao' | 'tmap', station: Station, rank: number) => {
    trackEvent('map_click', '/ev-finder', {
      provider,
      stationId: station.id,
      stationName: station.name,
      rank,
      charger: chargerFilter,
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

          {/* Operator Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              사업자 필터 <span className="text-slate-600 font-normal">(선택 안 하면 전체)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(OPERATOR_NAMES).map(([code, name]) => {
                const isSelected = selectedOperators.has(code)
                const color = OPERATOR_COLORS[code] || DEFAULT_COLOR
                return (
                  <motion.button
                    key={code}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleOperator(code)}
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

          {/* Saved Locations (Home / Work) */}
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
                      <SlotIcon className="h-4 w-4 text-emerald-300" />
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

        {/* ── Recent Searches & Favorite Stations ─────────── */}
        {(recentSearches.length > 0 || favoriteStations.length > 0) && (
          <div className="grid gap-6 mb-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                <History className="h-4 w-4 text-cyan-400" />
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
                            {getChargerFilterLabel(item.charger)} · {item.radius / 1000}km · {getSortLabel(item.sort)}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-cyan-300">바로 검색</span>
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
                <Star className="h-4 w-4 text-emerald-300" />
                즐겨찾기 충전소
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
                            {item.operator} · {getChargerFilterLabel(item.charger)}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            최근 본 단가 {item.minPrice.toFixed(1)}원/kWh · {formatDistance(item.distance)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFavoriteStation(item)}
                          className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:border-emerald-400"
                        >
                          해제
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">아직 저장된 즐겨찾기 충전소가 없습니다.</p>
                )}
              </div>
            </section>
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
            <Battery className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">주변에 충전소가 없습니다...</p>
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
                      {cachedResultMeta.label} 기준 {getChargerFilterLabel(cachedResultMeta.charger)} 결과를{' '}
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
                  충전소 발견
                  {selectedOperators.size > 0 && (
                    <span className="text-slate-600"> (전체 {stations.length}개 중)</span>
                  )}
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
              {filteredStations.map((station, index) => {
                const operatorColor = OPERATOR_COLORS[station.operatorId] || DEFAULT_COLOR
                const reaction = getPriceReaction(station.minPrice)
                const isFirst = index === 0
                const driveTime = getDriveTime(station.distance)
                const costEstimate = getChargeCostEstimate(station.minPrice)
                const badge = getRankBadge(index + 1)
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
                      ${operatorColor.border}
                      ${isFirst
                        ? 'bg-slate-900 border border-emerald-800/50'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                      }
                      transition-colors
                    `}
                  >
                    {isFirst && <ConfettiBurst />}

                    <div className="p-4 relative z-20">
                      {/* Top: rank + availability + drive time */}
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
                            {index + 1}<span className="text-slate-600">/{filteredStations.length}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleFavoriteStation(station)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
                              favoriteStation
                                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
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
                          <p className="text-xs text-slate-500 truncate mt-1">{station.addr}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-3xl font-black ${isFirst ? 'text-emerald-400' : 'text-white'}`}>
                            <AnimatedPrice value={station.minPrice} delay={index * 80} decimals={1} />
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

            {/* Savings Analysis */}
            <SavingsAnalysis stations={filteredStations} />

            {/* Pricing note */}
            <div className="mt-8 mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
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
