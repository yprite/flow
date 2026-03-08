const KV_URL = process.env.KV_REST_API_URL || ''
const KV_TOKEN = process.env.KV_REST_API_TOKEN || ''

const HISTORY_WINDOW_DAYS = 14
const HISTORY_TTL_SECONDS = 120 * 24 * 60 * 60

export interface StationHistoryPoint {
  date: string
  price: number
}

interface StationSnapshot {
  id: string
  price: number
}

function hasKvEnv() {
  return Boolean(KV_URL && KV_TOKEN)
}

async function kvPipeline(cmds: (string | number)[][]): Promise<{ result: unknown }[]> {
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmds),
  })

  if (!res.ok) {
    throw new Error(`Redis pipeline failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

function stationHistoryKey(fuel: string, stationId: string) {
  return `g:hist:${fuel}:${stationId}`
}

function getRecentDates(windowDays = HISTORY_WINDOW_DAYS) {
  return Array.from({ length: windowDays }, (_, index) => {
    const target = new Date(Date.now() - (windowDays - 1 - index) * 24 * 60 * 60 * 1000)
    return target.toISOString().slice(0, 10)
  })
}

function parseHistoryValues(
  dates: string[],
  raw: unknown,
  today: string,
  currentPrice: number,
): StationHistoryPoint[] {
  const values = Array.isArray(raw) ? raw : []
  const history: StationHistoryPoint[] = []

  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i]
    const value = values[i]
    const parsed =
      date === today
        ? currentPrice
        : value === null || value === undefined
          ? null
          : parseInt(String(value), 10)

    if (parsed !== null && Number.isFinite(parsed)) {
      history.push({ date, price: parsed })
    }
  }

  if (!history.some((point) => point.date === today)) {
    history.push({ date: today, price: currentPrice })
  }

  return history.sort((a, b) => a.date.localeCompare(b.date))
}

export async function hydrateStationPriceHistory<T extends StationSnapshot>(
  fuel: string,
  stations: T[],
): Promise<Array<T & { history: StationHistoryPoint[]; priceChange: number | null }>> {
  if (stations.length === 0 || !hasKvEnv()) {
    return stations.map((station) => ({
      ...station,
      history: [],
      priceChange: null,
    }))
  }

  const today = new Date().toISOString().slice(0, 10)
  const recentDates = getRecentDates()
  const cmds: (string | number)[][] = []

  for (const station of stations) {
    const key = stationHistoryKey(fuel, station.id)
    cmds.push(['HSET', key, today, station.price])
    cmds.push(['EXPIRE', key, HISTORY_TTL_SECONDS])
  }

  for (const station of stations) {
    cmds.push(['HMGET', stationHistoryKey(fuel, station.id), ...recentDates])
  }

  try {
    const results = await kvPipeline(cmds)
    const historyOffset = stations.length * 2

    return stations.map((station, index) => {
      const rawHistory = results[historyOffset + index]?.result
      const history = parseHistoryValues(recentDates, rawHistory, today, station.price)
      const previous = history.length >= 2 ? history[history.length - 2].price : null

      return {
        ...station,
        history,
        priceChange: previous === null ? null : station.price - previous,
      }
    })
  } catch (error) {
    console.error(
      '[gas-history] hydrateStationPriceHistory 실패:',
      error instanceof Error ? error.message : '알 수 없는 오류',
    )

    return stations.map((station) => ({
      ...station,
      history: [],
      priceChange: null,
    }))
  }
}
