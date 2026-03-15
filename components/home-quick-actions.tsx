'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Building2, Fuel, History, House, MapPin, WifiOff, Zap } from 'lucide-react'
import { trackEvent } from '@/lib/analytics-client'

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

interface CachedSearchSnapshot {
  id: string
  label: string
  lat: number
  lng: number
  fuel: string
  radius: number
  sort: string
  locationSource: LocationSource
  cachedAt: string
}

const STORAGE_KEYS = {
  savedLocations: 'gas-finder:saved-locations',
  recentSearches: 'gas-finder:recent-searches',
  cachedSearchSnapshots: 'gas-finder:cached-search-snapshots',
} as const

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function getFuelLabel(fuel: string) {
  const labels: Record<string, string> = {
    B027: '휘발유',
    D047: '경유',
    B034: '고급유',
    K015: 'LPG',
  }

  return labels[fuel] || fuel
}

function formatCacheTimestamp(date: string) {
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

export function HomeQuickActions() {
  const [savedLocations, setSavedLocations] = useState<SavedLocationRecord[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearchRecord[]>([])
  const [cachedSearchSnapshots, setCachedSearchSnapshots] = useState<CachedSearchSnapshot[]>([])

  useEffect(() => {
    const refresh = () => {
      setSavedLocations(readStoredJson<SavedLocationRecord[]>(STORAGE_KEYS.savedLocations, []))
      setRecentSearches(readStoredJson<RecentSearchRecord[]>(STORAGE_KEYS.recentSearches, []))
      setCachedSearchSnapshots(
        readStoredJson<CachedSearchSnapshot[]>(STORAGE_KEYS.cachedSearchSnapshots, []),
      )
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }

    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const homeLocation = savedLocations.find((item) => item.slot === 'home')
  const workLocation = savedLocations.find((item) => item.slot === 'work')
  const cachedSearchSnapshotMap = new Map(
    cachedSearchSnapshots.map((item) => [item.id, item] as const),
  )

  const actions = [
    homeLocation
      ? {
          key: 'home-saved',
          href: `/gas-finder?lat=${homeLocation.lat}&lng=${homeLocation.lng}&label=${encodeURIComponent(homeLocation.label)}&radius=2000&sort=1&shortcut=home-saved`,
          title: '집 기준 검색',
          description: homeLocation.label,
          accent: 'from-emerald-500/20 to-emerald-400/5 border-emerald-400/20 text-emerald-100',
          icon: House,
          type: 'saved',
        }
      : null,
    workLocation
      ? {
          key: 'work-saved',
          href: `/gas-finder?lat=${workLocation.lat}&lng=${workLocation.lng}&label=${encodeURIComponent(workLocation.label)}&radius=3000&sort=1&shortcut=work-saved`,
          title: '회사 기준 검색',
          description: workLocation.label,
          accent: 'from-sky-500/20 to-sky-400/5 border-sky-400/20 text-sky-100',
          icon: Building2,
          type: 'saved',
        }
      : null,
    {
      key: 'current-finder',
      href: '/gas-finder?shortcut=finder-home',
      title: '내 주변 최저가',
      description: '현재 위치로 바로 비교',
      accent: 'from-rose-500/20 to-amber-400/5 border-rose-400/20 text-rose-50',
      icon: Zap,
      type: 'dynamic',
    },
    {
      key: 'diesel-quick',
      href: '/gas-finder?fuel=D047&radius=3000&sort=1&shortcut=diesel-home',
      title: '경유 3km',
      description: '경유 가격순 바로 보기',
      accent: 'from-amber-500/20 to-yellow-300/5 border-amber-400/20 text-amber-50',
      icon: Fuel,
      type: 'preset',
    },
    {
      key: 'seoul-quick',
      href: `/gas-finder?lat=37.5665&lng=126.978&label=${encodeURIComponent('서울시청')}&fuel=B027&radius=3000&preset=seoul&shortcut=seoul-home`,
      title: '서울 기준 검색',
      description: '서울시청 중심으로 시작',
      accent: 'from-violet-500/20 to-fuchsia-400/5 border-violet-400/20 text-violet-50',
      icon: MapPin,
      type: 'preset',
    },
  ].filter(Boolean) as Array<{
    key: string
    href: string
    title: string
    description: string
    accent: string
    icon: typeof Zap
    type: 'saved' | 'dynamic' | 'preset' | 'resume'
  }>

  const recentResumeActions = recentSearches
    .map((item) => {
      const cachedSnapshot = cachedSearchSnapshotMap.get(item.id)
      if (!cachedSnapshot) return null

      return {
        key: `resume-${item.id}`,
        href:
          `/gas-finder?lat=${item.lat}&lng=${item.lng}` +
          `&label=${encodeURIComponent(item.label)}` +
          `&fuel=${item.fuel}&radius=${item.radius}&sort=${item.sort}` +
          `&shortcut=resume-home`,
        title: item.label,
        meta: `${getFuelLabel(item.fuel)} · ${item.radius / 1000}km`,
        cachedAt: formatCacheTimestamp(cachedSnapshot.cachedAt),
      }
    })
    .filter(Boolean)
    .slice(0, 2) as Array<{
    key: string
    href: string
    title: string
    meta: string
    cachedAt: string
  }>

  return (
    <div className="mt-8 rounded-[28px] border border-white/8 bg-slate-950/70 p-5 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200/80">
            Quick Start
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            열자마자 바로 찾는 실행 카드
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">
          자주 쓰는 조건을 다시 맞추지 않도록, 홈에서 바로 검색 화면으로 넘깁니다.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.key}
              href={action.href}
              onClick={() =>
                trackEvent('home_quick_action_opened', '/', {
                  action: action.key,
                  type: action.type,
                })
              }
              className={`rounded-2xl border bg-gradient-to-br p-4 transition-transform hover:-translate-y-1 ${action.accent}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Open
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black tracking-tight text-white">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">{action.description}</p>
            </Link>
          )
        })}
      </div>

      {recentResumeActions.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                Resume
              </p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-white">
                최근 검색 바로 이어가기
              </h3>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              캐시가 있는 검색은 오프라인에서도 다시 열 수 있습니다.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recentResumeActions.map((action) => (
              <Link
                key={action.key}
                href={action.href}
                onClick={() =>
                  trackEvent('home_quick_action_opened', '/', {
                    action: action.key,
                    type: 'resume',
                  })
                }
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-emerald-100">
                    <History className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-slate-950/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    <WifiOff className="h-3 w-3" />
                    Cached
                  </span>
                </div>
                <h4 className="mt-4 text-lg font-black tracking-tight text-white">{action.title}</h4>
                <p className="mt-2 text-sm leading-6 text-emerald-50/85">{action.meta}</p>
                <p className="mt-3 text-xs font-semibold text-emerald-100/80">
                  저장 시각 {action.cachedAt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
