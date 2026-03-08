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
  Newspaper,
  ArrowLeft,
} from 'lucide-react'
import { ServiceShareButton } from '@/components/service-share-button'
import { trackEvent, trackPageView } from '@/lib/analytics-client'

// ─── Types ─────────────────────────────────────────────────────
interface Station {
  rank: number
  id: string
  name: string
  brand: string
  price: number
  distance: number
}

interface AvgPrice {
  fuel: string
  name: string
  price: number
  diff: number
}

interface NewsItem {
  title: string
  link: string
  date: string
  source: string
}

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

const FALLBACK_MARQUEE =
  '긴급속보 :: 기름값이 또 올랐습니다 :: 지갑이 울고 있습니다 :: 걸어다닐까 진지하게 고민 중 :: 자전거가 답인가 :: 전기차 사고 싶다 :: 버스비도 올랐잖아 :: 그냥 집에 있자'

const DEFAULT_LOCATION = {
  lat: 37.5665,
  lng: 126.978,
  label: '서울시청',
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

function relativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
  } catch {
    return ''
  }
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
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...')
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [searched, setSearched] = useState(false)
  const [averages, setAverages] = useState<AvgPrice[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [locationSource, setLocationSource] = useState<'preset' | 'geolocation' | 'fallback'>(
    'fallback',
  )

  const sharePath = `/gas-finder?fuel=${fuel}&radius=${radius}&sort=${sort}`

  // Analytics tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    trackPageView('/gas-finder', {
      pageType: 'finder',
      preset: params.get('preset') || null,
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

    if (rawLat != null && rawLng != null && !Number.isNaN(presetLat) && !Number.isNaN(presetLng)) {
      setLocation({ lat: presetLat, lng: presetLng })
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
          setLocationStatus(
            `현재 위치 확인됨 (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          )
          setLocationSource('geolocation')
        },
        () => {
          setLocation({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng })
          setLocationStatus(`위치 확인 실패 \u2192 ${DEFAULT_LOCATION.label} 기준으로 검색합니다`)
          setLocationSource('fallback')
        },
      )
    } else {
      setLocation({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng })
      setLocationStatus(`위치 기능 미지원 \u2192 ${DEFAULT_LOCATION.label} 기준으로 검색합니다`)
      setLocationSource('fallback')
    }
  }, [])

  // Fetch averages + news on mount
  useEffect(() => {
    fetch('/api/gas/average')
      .then((r) => r.json())
      .then((data) => {
        if (data.averages) setAverages(data.averages)
      })
      .catch(() => {})

    fetch('/api/news')
      .then((r) => r.json())
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) setNews(items)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!searched || loading || error) return

    trackEvent(stations.length > 0 ? 'results_rendered' : 'results_empty', '/gas-finder', {
      fuel,
      radius,
      sort,
      count: stations.length,
      locationSource,
    })
  }, [error, fuel, loading, locationSource, radius, searched, sort, stations.length])

  const handleSearch = async () => {
    if (!location) return
    setLoading(true)
    setError(null)
    setStations([])
    setSearched(false)
    setLoadingMessage(
      LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    )
    trackEvent('search_executed', '/gas-finder', {
      fuel,
      radius,
      sort,
      locationSource,
      brandFilterCount: selectedBrands.size,
    })

    try {
      const res = await fetch(
        `/api/gas?lat=${location.lat}&lng=${location.lng}&fuel=${fuel}&radius=${radius}&sort=${sort}`,
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

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) next.delete(brand)
      else next.add(brand)
      return next
    })
  }

  // Filter stations by selected brands
  const filteredStations =
    selectedBrands.size === 0
      ? stations
      : stations.filter((s) => selectedBrands.has(s.brand))

  const maxPrice = filteredStations.length > 0 ? Math.max(...filteredStations.map((s) => s.price)) : 0
  const cheapestPrice = filteredStations.length > 0 ? Math.min(...filteredStations.map((s) => s.price)) : 0
  const mostExpensivePrice = maxPrice

  // Build marquee text from news or fallback
  const marqueeText =
    news.length > 0
      ? news.map((n) => `${n.title} (${n.source})`).join(' :: ')
      : FALLBACK_MARQUEE

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

      {/* ── News Ticker ────────────────────────────────────── */}
      <div className="bg-rose-950/50 border-y border-rose-900/50 overflow-hidden">
        <div className="flex items-center">
          {news.length > 0 && (
            <div className="shrink-0 px-3 py-2 bg-rose-900/80 border-r border-rose-800/50 flex items-center gap-1">
              <Newspaper className="w-3 h-3 text-rose-400" />
              <span className="text-xs font-bold text-rose-300">유가 뉴스</span>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
              <span className="py-2 px-4 text-rose-400 text-sm shrink-0">
                {'\uD83D\uDEA8'} {marqueeText} &nbsp;&nbsp;&nbsp;
              </span>
              <span className="py-2 px-4 text-rose-400 text-sm shrink-0">
                {'\uD83D\uDEA8'} {marqueeText} &nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ── News Headlines ───────────────────────────────── */}
        {news.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5"
          >
            <h2 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              유가 &middot; 국제 뉴스
            </h2>
            <div className="space-y-2">
              {news.slice(0, 5).map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group hover:bg-slate-800/50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <span className="text-rose-500 text-xs font-bold mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200 group-hover:text-white truncate transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {item.source}
                      {item.date && ` \u00B7 ${relativeTime(item.date)}`}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-slate-400 mt-1 shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Average Prices ───────────────────────────────── */}
        {averages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              전국 평균 기름값
            </h2>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-4"
            >
              <span className="text-slate-400 text-sm">
                총 <span className="text-white font-bold">{filteredStations.length}</span>개
                주유소 발견
                {selectedBrands.size > 0 && (
                  <span className="text-slate-600"> (전체 {stations.length}개 중)</span>
                )}
              </span>
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

                      {/* Bottom: reaction + distance + map */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500 italic truncate flex-1">
                          {reaction}
                        </p>
                        <div className="flex items-center gap-3 shrink-0">
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
        </footer>
      </main>
    </div>
  )
}
