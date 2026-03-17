import { NextRequest, NextResponse } from 'next/server'

// ─── Haversine distance (meters) ────────────────────────────────
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Region code mapping (시도코드) ─────────────────────────────
// lat/lng center points for each region
const REGION_CENTERS: { code: string; name: string; lat: number; lng: number }[] = [
  { code: '11', name: '서울', lat: 37.5665, lng: 126.978 },
  { code: '26', name: '부산', lat: 35.1796, lng: 129.0756 },
  { code: '27', name: '대구', lat: 35.8714, lng: 128.6014 },
  { code: '28', name: '인천', lat: 37.4563, lng: 126.7052 },
  { code: '29', name: '광주', lat: 35.1595, lng: 126.8526 },
  { code: '30', name: '대전', lat: 36.3504, lng: 127.3845 },
  { code: '31', name: '울산', lat: 35.5384, lng: 129.3114 },
  { code: '36', name: '세종', lat: 36.48, lng: 127.2589 },
  { code: '41', name: '경기', lat: 37.4138, lng: 127.5183 },
  { code: '42', name: '강원', lat: 37.8228, lng: 128.1555 },
  { code: '43', name: '충북', lat: 36.6357, lng: 127.4912 },
  { code: '44', name: '충남', lat: 36.5184, lng: 126.8 },
  { code: '45', name: '전북', lat: 35.7175, lng: 127.153 },
  { code: '46', name: '전남', lat: 34.8679, lng: 126.991 },
  { code: '47', name: '경북', lat: 36.4919, lng: 128.8889 },
  { code: '48', name: '경남', lat: 35.4606, lng: 128.2132 },
  { code: '50', name: '제주', lat: 33.4996, lng: 126.5312 },
]

function getClosestRegionCodes(lat: number, lng: number, count: number): string[] {
  return REGION_CENTERS
    .map((r) => ({ code: r.code, dist: haversineDistance(lat, lng, r.lat, r.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((r) => r.code)
}

// ─── Charger type labels ────────────────────────────────────────
const CHARGER_TYPE_NAMES: Record<string, string> = {
  '01': 'DC차데모',
  '02': 'AC완속',
  '03': 'DC차데모+AC3상',
  '04': 'DC콤보',
  '05': 'DC차데모+DC콤보',
  '06': 'DC차데모+AC3상+DC콤보',
  '07': 'AC3상',
  '08': 'DC콤보(완속)',
  '89': 'H2',
}

// ─── Status labels ──────────────────────────────────────────────
const STATUS_NAMES: Record<string, string> = {
  '1': '통신이상',
  '2': '충전대기',
  '3': '충전중',
  '4': '운영중지',
  '5': '점검중',
  '9': '상태미확인',
}

// ─── Operator pricing (원/kWh, approximate as of 2026) ──────────
// Prices vary by time, membership, etc. These are representative rates.
const OPERATOR_PRICES: Record<string, { slow: number; fast: number; label: string }> = {
  ME: { slow: 324.4, fast: 347.2, label: '환경부' },
  HE: { slow: 292.9, fast: 309.1, label: '한국전기차충전서비스' },
  PI: { slow: 320, fast: 350, label: '차지비' },
  KP: { slow: 310, fast: 340, label: '한국전력' },
  GN: { slow: 310, fast: 360, label: 'GS칼텍스' },
  SK: { slow: 280, fast: 340, label: 'SK시그넷' },
  SF: { slow: 280, fast: 330, label: 'SK에너지' },
  EV: { slow: 300, fast: 350, label: '에버온' },
  KL: { slow: 310, fast: 360, label: '클린일렉스' },
  JD: { slow: 300, fast: 350, label: '제주전기자동차서비스' },
  ST: { slow: 290, fast: 330, label: '스타코프' },
  PW: { slow: 300, fast: 340, label: '파워큐브' },
  HD: { slow: 330, fast: 360, label: '현대자동차' },
  SG: { slow: 360, fast: 400, label: '시그넷이브이' },
  CT: { slow: 280, fast: 310, label: 'CTYPE' },
  RE: { slow: 300, fast: 340, label: '레드이엔지' },
  NT: { slow: 310, fast: 350, label: '이카플러그' },
  DP: { slow: 300, fast: 340, label: '대영채비' },
  TS: { slow: 0, fast: 360, label: '테슬라 슈퍼차저' },
}

const DEFAULT_PRICE = { slow: 324, fast: 347, label: '기타' }

function getOperatorPrice(busiId: string) {
  return OPERATOR_PRICES[busiId] || DEFAULT_PRICE
}

// ─── Raw API item type ──────────────────────────────────────────
interface RawStation {
  statNm: string
  statId: string
  addr: string
  lat: string
  lng: string
  chgerType: string
  output: string
  busiId: string
  busiNm: string
  stat: string
  statUpdDt: string
  useTime: string
  parkingFree: string
  limitYn: string
  limitDetail: string
}

// ─── Tesla Supercharger types ────────────────────────────────────
interface SuperchargeInfoSite {
  id: number
  name: string
  status: string // OPEN, CONSTRUCTION, PERMIT, CLOSED
  address: { street: string; city: string; state: string; country: string }
  gps: { latitude: number; longitude: number }
  stallCount: number
  powerKilowatt: number
  dateOpened: string | null
}

// Tesla supercharger cache (shared across requests, 1 hour TTL)
let teslaCacheData: SuperchargeInfoSite[] | null = null
let teslaCacheExpires = 0

async function fetchTeslaSuperchargers(): Promise<SuperchargeInfoSite[]> {
  const now = Date.now()
  if (teslaCacheData && teslaCacheExpires > now) {
    return teslaCacheData
  }

  try {
    const res = await fetch('https://supercharge.info/service/supercharge/allSites', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return teslaCacheData || []

    const sites: SuperchargeInfoSite[] = await res.json()

    // Filter Korea only + OPEN status
    const koreaSites = sites.filter(
      (s) =>
        s.address.country === 'South Korea' &&
        s.status === 'OPEN' &&
        s.gps.latitude > 0 &&
        s.gps.longitude > 0,
    )

    teslaCacheData = koreaSites
    teslaCacheExpires = now + 3600 * 1000 // 1 hour
    return koreaSites
  } catch {
    return teslaCacheData || []
  }
}

// ─── Valid charger type filter ──────────────────────────────────
const VALID_CHARGER_TYPES = ['all', 'fast', 'slow']

// ─── Cache ──────────────────────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Result cache (keyed by rounded coords + params)
const resultCache = new Map<string, { data: unknown; expires: number }>()

function getResultCacheKey(lat: number, lng: number, radius: number, chargerFilter: string, sort: string) {
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLng = Math.round(lng * 100) / 100
  return `ev:${roundedLat}:${roundedLng}:${radius}:${chargerFilter}:${sort}`
}

// Region-level raw data cache (reused across different user searches in same region)
const regionCache = new Map<string, { data: RawStation[]; expires: number }>()

// ─── API handler ────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radius = parseInt(searchParams.get('radius') || '3000', 10)
  const chargerFilter = searchParams.get('charger') || 'all'
  const sort = searchParams.get('sort') || '1' // 1=distance, 2=price

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: '좌표를 안 보내시면 충전소를 못 찾습니다 ㅋㅋ' },
      { status: 400 },
    )
  }

  if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
    return NextResponse.json(
      { error: '좌표가 한반도 밖입니다! 여긴 한국 충전소만 됩니다 ㅋㅋ' },
      { status: 400 },
    )
  }

  if (radius < 500 || radius > 10000) {
    return NextResponse.json(
      { error: '반경은 500m~10km 사이로 해주세요.' },
      { status: 400 },
    )
  }

  if (!VALID_CHARGER_TYPES.includes(chargerFilter)) {
    return NextResponse.json(
      { error: '충전 타입은 all, fast, slow 중 하나입니다.' },
      { status: 400 },
    )
  }

  const apiKey = process.env.EV_CHARGER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: '전기차 충전소 API 키가 없습니다. 서버 관리자에게 문의하세요.' },
      { status: 500 },
    )
  }

  // Check result cache
  const cacheKey = getResultCacheKey(lat, lng, radius, chargerFilter, sort)
  const cached = resultCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data)
  }

  // Query up to 2 closest regions to cover border areas
  const zcodes = getClosestRegionCodes(lat, lng, 2)
  const PAGE_SIZE = 9999

  // Fetch all pages for a given zcode (with region-level cache)
  async function fetchRegion(zcode: string): Promise<RawStation[]> {
    const regionCached = regionCache.get(zcode)
    if (regionCached && regionCached.expires > Date.now()) {
      return regionCached.data
    }

    const allItems: RawStation[] = []
    let pageNo = 1
    let totalCount = Infinity

    while (allItems.length < totalCount) {
      const url =
        `https://apis.data.go.kr/B552584/EvCharger/getChargerInfo` +
        `?serviceKey=${encodeURIComponent(apiKey!)}` +
        `&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}&dataType=JSON` +
        `&zcode=${zcode}`

      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) break

      const data = await response.json()
      const items = data?.items?.item
      if (!items || !Array.isArray(items)) break

      totalCount = parseInt(data?.totalCount || data?.body?.totalCount || '0', 10) || items.length
      allItems.push(...(items as RawStation[]))
      pageNo++

      // Safety: max 2 pages per region (9999 items covers most regions)
      if (pageNo > 2) break
    }

    // Cache at region level
    if (allItems.length > 0) {
      regionCache.set(zcode, { data: allItems, expires: Date.now() + CACHE_TTL })
    }

    return allItems
  }

  try {
    // Fetch government API regions + Tesla in parallel
    const [regionResults, teslaSites] = await Promise.all([
      Promise.allSettled(zcodes.map(fetchRegion)),
      fetchTeslaSuperchargers(),
    ])

    const allItems: RawStation[] = []
    for (const result of regionResults) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      }
    }

    if (allItems.length === 0 && teslaSites.length === 0) {
      return NextResponse.json(
        { error: '충전소 데이터를 가져오지 못했습니다.' },
        { status: 502 },
      )
    }

    // Process stations: calculate distance, filter by radius
    const stationsMap = new Map<
      string,
      {
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
        chargers: {
          type: string
          typeName: string
          output: number
          status: string
          statusName: string
          isFast: boolean
          price: number
          updatedAt: string
        }[]
      }
    >()

    // Deduplicate chargers from overlapping region queries
    const seenChargers = new Set<string>()
    for (const item of allItems) {
      const stationLat = parseFloat(item.lat)
      const stationLng = parseFloat(item.lng)

      if (isNaN(stationLat) || isNaN(stationLng)) continue

      // Skip duplicate charger entries from multi-region queries
      const chargerKey = `${item.statId}:${item.chgerType}:${item.output}:${item.stat}`
      if (seenChargers.has(chargerKey)) continue
      seenChargers.add(chargerKey)

      const distance = Math.round(haversineDistance(lat, lng, stationLat, stationLng))
      if (distance > radius) continue

      const output = parseInt(item.output || '0', 10)
      const isFast = output >= 50
      const chargerTypeName = CHARGER_TYPE_NAMES[item.chgerType] || `타입${item.chgerType}`
      const statusName = STATUS_NAMES[item.stat] || '상태미확인'
      const operatorPricing = getOperatorPrice(item.busiId)
      const price = isFast ? operatorPricing.fast : operatorPricing.slow

      // Filter by charger type
      if (chargerFilter === 'fast' && !isFast) continue
      if (chargerFilter === 'slow' && isFast) continue

      const charger = {
        type: item.chgerType,
        typeName: chargerTypeName,
        output,
        status: item.stat,
        statusName,
        isFast,
        price,
        updatedAt: item.statUpdDt || '',
      }

      const existing = stationsMap.get(item.statId)
      if (existing) {
        existing.chargers.push(charger)
      } else {
        stationsMap.set(item.statId, {
          id: item.statId,
          name: item.statNm,
          addr: item.addr,
          lat: stationLat,
          lng: stationLng,
          distance,
          operator: item.busiNm || operatorPricing.label,
          operatorId: item.busiId,
          useTime: item.useTime || '24시간',
          parkingFree: item.parkingFree === 'Y',
          limitYn: item.limitYn === 'Y',
          limitDetail: item.limitDetail || '',
          chargers: [charger],
        })
      }
    }

    // ── Merge Tesla Superchargers (already fetched in parallel) ─
    const teslaPrice = OPERATOR_PRICES.TS

    for (const site of teslaSites) {
      const distance = Math.round(haversineDistance(lat, lng, site.gps.latitude, site.gps.longitude))
      if (distance > radius) continue

      // Skip if charger filter is 'slow' (Superchargers are all fast)
      if (chargerFilter === 'slow') continue

      const stationId = `tesla-sc-${site.id}`
      if (stationsMap.has(stationId)) continue

      const output = site.powerKilowatt || 250
      const chargers = Array.from({ length: site.stallCount || 1 }, (_, i) => ({
        type: 'NACS',
        typeName: output >= 250 ? `슈퍼차저 V3 (${output}kW)` : `슈퍼차저 (${output}kW)`,
        output,
        status: '9', // 실시간 상태 미제공
        statusName: '상태미확인',
        isFast: true,
        price: teslaPrice.fast,
        updatedAt: '',
      }))

      stationsMap.set(stationId, {
        id: stationId,
        name: `Tesla ${site.name}`,
        addr: [site.address.street, site.address.city, site.address.state]
          .filter(Boolean)
          .join(' '),
        lat: site.gps.latitude,
        lng: site.gps.longitude,
        distance,
        operator: '테슬라 슈퍼차저',
        operatorId: 'TS',
        useTime: '24시간',
        parkingFree: false,
        limitYn: false,
        limitDetail: '',
        chargers,
      })
    }

    let stations = Array.from(stationsMap.values()).map((station) => {
      const fastChargers = station.chargers.filter((c) => c.isFast)
      const slowChargers = station.chargers.filter((c) => !c.isFast)
      const availableCount = station.chargers.filter((c) => c.status === '2').length
      const prices = station.chargers.map((c) => c.price)
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
      const maxOutput = Math.max(...station.chargers.map((c) => c.output), 0)

      return {
        ...station,
        fastCount: fastChargers.length,
        slowCount: slowChargers.length,
        totalCount: station.chargers.length,
        availableCount,
        minPrice,
        maxOutput,
      }
    })

    // Sort
    if (sort === '2') {
      stations.sort((a, b) => a.minPrice - b.minPrice || a.distance - b.distance)
    } else {
      stations.sort((a, b) => a.distance - b.distance || a.minPrice - b.minPrice)
    }

    // Limit to top 50 results
    stations = stations.slice(0, 50)

    // Add rank
    const rankedStations = stations.map((s, i) => ({ rank: i + 1, ...s }))
    const result = { count: rankedStations.length, stations: rankedStations }

    // Cache result
    const now = Date.now()
    for (const [key, entry] of resultCache) {
      if (entry.expires <= now) resultCache.delete(key)
    }
    for (const [key, entry] of regionCache) {
      if (entry.expires <= now) regionCache.delete(key)
    }
    resultCache.set(cacheKey, { data: result, expires: now + CACHE_TTL })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: '충전소 서버가 바쁜가 봅니다... 잠시만 기다려주세요' },
      { status: 502 },
    )
  }
}
