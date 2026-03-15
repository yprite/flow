'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, Share2, Smartphone, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics-client'

declare global {
  interface Navigator {
    standalone?: boolean
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const INSTALLABLE_PATHS = new Set(['/', '/gas-finder'])

function isStandaloneMode() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIosSafari() {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent
  const isIosDevice = /iphone|ipad|ipod/i.test(userAgent)
  const isSafariBrowser = /safari/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent)

  return isIosDevice && isSafariBrowser
}

function getSurface(pathname: string) {
  return pathname === '/gas-finder' ? 'finder' : 'home'
}

export function PwaInstallPrompt() {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [manualInstall, setManualInstall] = useState(false)

  useEffect(() => {
    if (!pathname || !INSTALLABLE_PATHS.has(pathname)) {
      setVisible(false)
      setManualInstall(false)
      setDeferredPrompt(null)
      return
    }

    if (typeof window === 'undefined' || isStandaloneMode()) {
      setVisible(false)
      return
    }

    const dismissKey = `pwa:install-dismissed:${pathname}`
    const viewedKey = `pwa:install-viewed:${pathname}`
    const surface = getSurface(pathname)

    const trackViewed = (platform: string) => {
      if (window.sessionStorage.getItem(viewedKey)) return
      window.sessionStorage.setItem(viewedKey, '1')
      void trackEvent('install_prompt_viewed', pathname, {
        surface,
        platform,
      })
    }

    if (window.sessionStorage.getItem(dismissKey) === '1') {
      setVisible(false)
      return
    }

    if (isIosSafari()) {
      setManualInstall(true)
      setVisible(true)
      trackViewed('manual')
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setManualInstall(false)
      setDeferredPrompt(event)
      setVisible(true)
      trackViewed('browser-prompt')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [pathname])

  if (!pathname || !INSTALLABLE_PATHS.has(pathname) || !visible || isStandaloneMode()) {
    return null
  }

  const surface = getSurface(pathname)
  const platform = manualInstall ? 'manual' : 'browser-prompt'

  const dismissPrompt = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(`pwa:install-dismissed:${pathname}`, '1')
    }
    setVisible(false)
    setDeferredPrompt(null)
    void trackEvent('install_prompt_dismissed', pathname, {
      surface,
      platform,
    })
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    setVisible(false)
    setDeferredPrompt(null)

    void trackEvent(
      choice.outcome === 'accepted'
        ? 'install_prompt_accepted'
        : 'install_prompt_dismissed',
      pathname,
      {
        surface,
        platform: choice.platform || platform,
      },
    )
  }

  return (
    <aside className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-[28px] border border-white/10 bg-slate-950/90 p-5 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-200">
            {manualInstall ? <Share2 className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                  Install App
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-white">
                  홈 화면에서 더 빠르게 열 수 있습니다
                </h2>
              </div>
              <button
                type="button"
                aria-label="설치 배너 닫기"
                onClick={dismissPrompt}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {manualInstall
                ? 'Safari 공유 메뉴에서 "홈 화면에 추가"를 누르면 기름값 헌터를 앱처럼 바로 실행할 수 있습니다.'
                : '설치 후에는 브라우저 탭 대신 홈 화면에서 바로 열고, 최근 검색 흐름도 더 빠르게 이어갈 수 있습니다.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {manualInstall ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100">
                  <Share2 className="h-4 w-4 text-amber-200" />
                  공유 메뉴 → 홈 화면에 추가
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleInstall()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20"
                >
                  <Download className="h-4 w-4" />
                  설치하기
                </button>
              )}
              <button
                type="button"
                onClick={dismissPrompt}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
