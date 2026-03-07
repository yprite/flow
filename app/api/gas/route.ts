import { NextRequest, NextResponse } from 'next/server'

// ─── WGS84 ellipsoid ───────────────────────────────────────────
const WGS84_A = 6378137.0
const WGS84_F = 1 / 298.257223563
const WGS84_B = WGS84_A * (1 - WGS84_F)
const WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F

// ─── Bessel ellipsoid ──────────────────────────────────────────
const BESSEL_A = 6377397.155
const BESSEL_F = 1 / 299.152813
const BESSEL_E2 = 2 * BESSEL_F - BESSEL_F * BESSEL_F
const BESSEL_EP2 = BESSEL_E2 / (1 - BESSEL_E2)

// ─── Molodensky: WGS84 → Bessel ───────────────────────────────
const DX = -146.43
const DY = 507.89
const DZ = 681.46
const DA = BESSEL_A - WGS84_A
const DF = BESSEL_F - WGS84_F

// ─── TM128 projection parameters ──────────────────────────────
const PHI0 = (38 * Math.PI) / 180
const LAM0 = (128 * Math.PI) / 180
const K0 = 0.9999
const FE = 400000
const FN = 600000

const VALID_FUELS = ['B027', 'D047', 'B034', 'K015']

// ─── Molodensky transformation ─────────────────────────────────
function wgs84ToBessel(lat: number, lng: number): [number, number] {
  const phi = (lat * Math.PI) / 180
  const lam = (lng * Math.PI) / 180

  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const sinLam = Math.sin(lam)
  const cosLam = Math.cos(lam)

  const nu = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinPhi * sinPhi)
  const rho =
    (WGS84_A * (1 - WGS84_E2)) /
    Math.pow(1 - WGS84_E2 * sinPhi * sinPhi, 1.5)

  const dPhi =
    (-DX * sinPhi * cosLam -
      DY * sinPhi * sinLam +
      DZ * cosPhi +
      DA * ((nu * WGS84_E2 * sinPhi * cosPhi) / WGS84_A) +
      DF *
        (rho * (WGS84_A / WGS84_B) + nu * (WGS84_B / WGS84_A)) *
        sinPhi *
        cosPhi) /
    rho

  const dLam = (-DX * sinLam + DY * cosLam) / (nu * cosPhi)

  return [phi + dPhi, lam + dLam]
}

// ─── Bessel → TM128 (Transverse Mercator) ──────────────────────
function besselToTM128(phi: number, lam: number): [number, number] {
  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const tanPhi = Math.tan(phi)

  const N = BESSEL_A / Math.sqrt(1 - BESSEL_E2 * sinPhi * sinPhi)
  const T = tanPhi * tanPhi
  const C = BESSEL_EP2 * cosPhi * cosPhi
  const A = (lam - LAM0) * cosPhi

  const e2 = BESSEL_E2
  const e4 = e2 * e2
  const e6 = e4 * e2
  const M1 = 1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256
  const M2 = (3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024
  const M3 = (15 * e4) / 256 + (45 * e6) / 1024
  const M4 = (35 * e6) / 3072

  const calcM = (p: number) =>
    BESSEL_A *
    (M1 * p -
      M2 * Math.sin(2 * p) +
      M3 * Math.sin(4 * p) -
      M4 * Math.sin(6 * p))

  const M = calcM(phi)
  const M0 = calcM(PHI0)

  const A2 = A * A
  const A3 = A2 * A
  const A4 = A3 * A
  const A5 = A4 * A
  const A6 = A5 * A

  const x =
    FE +
    K0 *
      N *
      (A +
        ((1 - T + C) * A3) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * BESSEL_EP2) * A5) / 120)

  const y =
    FN +
    K0 *
      (M -
        M0 +
        N *
          tanPhi *
          (A2 / 2 +
            ((5 - T + 9 * C + 4 * C * C) * A4) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * BESSEL_EP2) * A6) / 720))

  return [x, y]
}

function wgs84ToTM128(lat: number, lng: number): [number, number] {
  const [besselPhi, besselLam] = wgs84ToBessel(lat, lng)
  return besselToTM128(besselPhi, besselLam)
}

// ─── API handler ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const fuel = searchParams.get('fuel') || 'B027'
  const radius = parseInt(searchParams.get('radius') || '2000', 10)
  const sort = searchParams.get('sort') || '1'

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: '좌표를 안 보내시면 저도 방법이 없습니다 ㅋㅋ' },
      { status: 400 },
    )
  }

  if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
    return NextResponse.json(
      { error: '좌표가 한반도 밖입니다! 여긴 한국 주유소만 됩니다 ㅋㅋ' },
      { status: 400 },
    )
  }

  if (radius < 500 || radius > 10000) {
    return NextResponse.json(
      {
        error:
          '반경은 500m~10km 사이로 해주세요. 너무 멀면 주유비가 기름값보다 비싸요 ㅋㅋ',
      },
      { status: 400 },
    )
  }

  if (!VALID_FUELS.includes(fuel)) {
    return NextResponse.json(
      { error: '그런 유종은 없습니다. 혹시 우주선 연료를 찾으시나요? ㅋㅋ' },
      { status: 400 },
    )
  }

  const apiKey = process.env.OPINET_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          '오피넷 API 키가 없습니다. 서버 관리자에게 문의하세요 (사실 저도 모름)',
      },
      { status: 500 },
    )
  }

  const [x, y] = wgs84ToTM128(lat, lng)

  const url = `http://www.opinet.co.kr/api/aroundAll.do?code=${apiKey}&out=json&x=${x.toFixed(0)}&y=${y.toFixed(0)}&radius=${radius}&prodcd=${fuel}&sort=${sort}`

  try {
    const response = await fetch(url, { cache: 'no-store' })
    const data = await response.json()

    if (!data.RESULT?.OIL) {
      return NextResponse.json(
        {
          error:
            '오피넷이 대답을 안 합니다... 잠시 후 다시 시도해주세요 ㅠㅠ',
        },
        { status: 502 },
      )
    }

    const stations = data.RESULT.OIL.map(
      (
        s: {
          UNI_ID: string
          OS_NM: string
          POLL_DIV_CD: string
          PRICE: number
          DISTANCE: number
        },
        i: number,
      ) => ({
        rank: i + 1,
        id: s.UNI_ID,
        name: s.OS_NM,
        brand: s.POLL_DIV_CD,
        price: s.PRICE,
        distance: s.DISTANCE,
      }),
    )

    return NextResponse.json({ count: stations.length, stations })
  } catch {
    return NextResponse.json(
      {
        error: '오피넷 서버가 바쁜가 봅니다... 잠시만 기다려주세요',
      },
      { status: 502 },
    )
  }
}
