import { NextResponse } from 'next/server'

const CACHE_TTL = 60 * 60 * 1000 // 1시간
let cache: { data: unknown; expires: number } | null = null

const FUEL_NAMES: Record<string, string> = {
  B027: '휘발유',
  D047: '경유',
  B034: '고급유',
  K015: 'LPG',
}

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json(cache.data)
  }

  const apiKey = process.env.OPINET_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: '오피넷 API 키가 없습니다' },
      { status: 500 },
    )
  }

  try {
    const url = `http://www.opinet.co.kr/api/avgAllPrice.do?code=${apiKey}&out=json`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (!data.RESULT?.OIL) {
      return NextResponse.json(
        { error: '전국 평균 데이터를 못 가져왔습니다' },
        { status: 502 },
      )
    }

    const averages = data.RESULT.OIL
      .filter(
        (item: { PRODCD: string }) => FUEL_NAMES[item.PRODCD],
      )
      .map(
        (item: {
          PRODCD: string
          PRICE: string
          DIFF: string
          TRADE_DT: string
        }) => ({
          fuel: item.PRODCD,
          name: FUEL_NAMES[item.PRODCD],
          price: parseFloat(item.PRICE),
          diff: parseFloat(item.DIFF),
          date: item.TRADE_DT,
        }),
      )

    const result = { averages, updatedAt: new Date().toISOString() }
    cache = { data: result, expires: Date.now() + CACHE_TTL }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: '오피넷 서버 응답 없음' },
      { status: 502 },
    )
  }
}
