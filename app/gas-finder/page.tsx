'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fuel,
  Search,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  BarChart3,
  Navigation,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ─────────────────────────────────────────────────────
interface Station {
  rank: number
  id: string
  name: string
  brand: string
  price: number
  distance: number
}

// ─── Constants ─────────────────────────────────────────────────
const FUEL_TYPES = [
  { code: 'B027', label: '휘발유', emoji: '\u26FD' },
  { code: 'D047', label: '경유', emoji: '\uD83D\uDE9B' },
  { code: 'B034', label: '고급유', emoji: '\uD83D\uDC8E' },
  { code: 'K015', label: 'LPG', emoji: '\uD83D\uDCA8' },
]

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

const LOADING_MESSAGES = [
  '오피넷 서버에 물어보는 중...',
  '주유소 사장님들한테 가격 물어보는 중...',
  '지갑 사정을 고려하는 중...',
  '최저가를 찾아 삼만리...',
  '기름값 비교하느라 머리 아픈 중...',
]

const MARQUEE_TEXT =
  '긴급속보 :: 기름값이 또 올랐습니다 :: 지갑이 울고 있습니다 :: 걸어다닐까 진지하게 고민 중 :: 자전거가 답인가 :: 전기차 사고 싶다 :: 버스비도 올랐잖아 :: 그냥 집에 있자'

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

function getRankBadge(
  rank: number,
): { emoji: string; label: string; color: string } | null {
  if (rank === 1)
    return {
      emoji: '\uD83D\uDC51',
      label: '갓 최저가',
      color: 'from-yellow-500 to-amber-500',
    }
  if (rank === 2)
    return {
      emoji: '\uD83E\uDD48',
      label: '2등',
      color: 'from-slate-300 to-slate-400',
    }
  if (rank === 3)
    return {
      emoji: '\uD83E\uDD49',
      label: '3등',
      color: 'from-amber-600 to-orange-700',
    }
  return null
}

// ─── Savings Analysis ──────────────────────────────────────────
function SavingsAnalysis({
  stations,
}: {
  stations: Station[]
}) {
  if (stations.length < 2) return null

  const prices = stations.map((s) => s.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const savingsWon = (maxPrice - minPrice) * 50

  let savingsComment: string
  if (savingsWon > 5000)
    savingsComment = '싼 데 가세요. 기름값 아끼면 치킨값!!!'
  else if (savingsWon > 2000) savingsComment = '커피값 정도는 아낄 수 있네요~'
  else if (savingsWon > 500) savingsComment = '뭐... 껌값 정도는 아낄 수 있음'
  else savingsComment = '걍 가까운 데 가세요. 차이 없음 ㅋㅋ'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-amber-400" />
        가격 분석 리포트{' '}
        <span className="text-sm font-normal text-slate-500">(매우 진지)</span>
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-4 text-center">
          <div className="text-xl md:text-2xl font-black text-emerald-400">
            {minPrice.toLocaleString()}
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">최저가</div>
        </div>
        <div className="bg-rose-950/50 border border-rose-800/50 rounded-xl p-4 text-center">
          <div className="text-xl md:text-2xl font-black text-rose-400">
            {maxPrice.toLocaleString()}
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-rose-500 mt-1">최고가</div>
        </div>
        <div className="bg-amber-950/50 border border-amber-800/50 rounded-xl p-4 text-center">
          <div className="text-xl md:text-2xl font-black text-amber-400">
            {savingsWon.toLocaleString()}
            <span className="text-sm">원</span>
          </div>
          <div className="text-xs text-amber-500 mt-1">50L 기준 절약</div>
        </div>
      </div>

      <p className="text-sm text-slate-400 text-center">
        {savingsComment}
      </p>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function GasFinderPage() {
  const [fuel, setFuel] = useState('B027')
  const [radius, setRadius] = useState(2000)
  const [sort, setSort] = useState('1')
  const [location, setLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...')
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          setLocationStatus(
            `현재 위치 확인됨 (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          )
        },
        () => {
          setLocation({ lat: 37.5665, lng: 126.978 })
          setLocationStatus(
            '위치 확인 실패 → 서울시청 기준으로 검색합니다',
          )
        },
      )
    } else {
      setLocation({ lat: 37.5665, lng: 126.978 })
      setLocationStatus(
        '위치 기능 미지원 → 서울시청 기준으로 검색합니다',
      )
    }
  }, [])

  const handleSearch = async () => {
    if (!location) return
    setLoading(true)
    setError(null)
    setStations([])
    setSearched(false)
    setLoadingMessage(
      LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    )

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

  const maxPrice =
    stations.length > 0 ? Math.max(...stations.map((s) => s.price)) : 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <div className="flex items-center gap-3">
            <Fuel className="w-10 h-10 text-rose-500" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              기름값 헌터
            </h1>
          </div>
          <p className="mt-3 text-slate-400 text-lg">
            월급은 통장을 스쳐가고... 기름값은 지갑을 관통한다
          </p>
        </div>
      </header>

      {/* ── Marquee ────────────────────────────────────────── */}
      <div className="bg-rose-950/50 border-y border-rose-900/50 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="py-2 px-4 text-rose-400 text-sm shrink-0">
            {'\uD83D\uDEA8'} {MARQUEE_TEXT} &nbsp;&nbsp;&nbsp;
          </span>
          <span className="py-2 px-4 text-rose-400 text-sm shrink-0">
            {'\uD83D\uDEA8'} {MARQUEE_TEXT} &nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* ── Search Panel ───────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8">
          {/* Fuel Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              유종 선택
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FUEL_TYPES.map((f) => (
                <button
                  key={f.code}
                  onClick={() => setFuel(f.code)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    fuel === f.code
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radius & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                반경
              </label>
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
              <label className="block text-sm font-medium text-slate-400 mb-2">
                정렬
              </label>
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

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{locationStatus}</span>
          </div>

          {/* Search Button */}
          <button
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
          </button>
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
        {stations.length > 0 && (
          <>
            <div className="mb-4 text-slate-400 text-sm">
              총{' '}
              <span className="text-white font-bold">{stations.length}</span>개
              주유소 발견
            </div>

            <div className="space-y-3 mb-8">
              {stations.map((station, index) => {
                const badge = getRankBadge(station.rank)
                const priceRatio =
                  maxPrice > 0 ? (station.price / maxPrice) * 100 : 100
                const brandName =
                  BRAND_NAMES[station.brand] || station.brand
                const brandComment = BRAND_COMMENTS[station.brand] || ''
                const reaction = getPriceReaction(station.price, fuel)

                return (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {badge && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${badge.color} text-white shrink-0`}
                          >
                            {badge.emoji} {badge.label}
                          </span>
                        )}
                        <span className="font-bold text-white truncate">
                          {station.name}
                        </span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400 shrink-0">
                        {station.price.toLocaleString()}
                        <span className="text-sm font-medium">원</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-3 flex-wrap">
                      <span>{brandName}</span>
                      {brandComment && (
                        <span className="text-slate-600 italic text-xs">
                          &ldquo;{brandComment}&rdquo;
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1 shrink-0">
                        <Navigation className="w-3 h-3" />
                        {formatDistance(station.distance)}
                      </span>
                    </div>

                    {/* Price bar */}
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className={`h-full rounded-full ${
                          station.rank <= 3
                            ? 'bg-emerald-500'
                            : 'bg-slate-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${priceRatio}%` }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.05,
                        }}
                      />
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      {reaction}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Savings Analysis ────────────────────────── */}
            <SavingsAnalysis stations={stations} />
          </>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="mt-12 border-t border-slate-800 pt-8 pb-12">
          <h3 className="text-slate-400 font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            주유 꿀팁
          </h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>
              {'>'} 셀프 주유소가 보통 더 쌉니다 (당연한 소리)
            </li>
            <li>
              {'>'} 월요일에 기름값이 떨어진다는 건 도시전설입니다
            </li>
            <li>
              {'>'} 이 사이트 보는 데이터 요금이 더 나올 수도 있음
            </li>
          </ul>
          <p className="text-xs text-slate-600 mt-6">
            데이터 출처: 한국석유공사 오피넷 (opinet.co.kr)
          </p>
        </footer>
      </main>
    </div>
  )
}
