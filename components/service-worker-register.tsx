'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics-client'

declare global {
  interface Navigator {
    standalone?: boolean
  }
}

const PWA_LAUNCH_TRACK_KEY = 'pwa:launch-tracked'

function isStandaloneMode() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isStandaloneMode() && !window.sessionStorage.getItem(PWA_LAUNCH_TRACK_KEY)) {
      window.sessionStorage.setItem(PWA_LAUNCH_TRACK_KEY, '1')
      void trackEvent('pwa_launch', window.location.pathname, {
        mode: 'standalone',
      })
    }

    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Service worker registration should not block the main product path.
    })
  }, [])

  return null
}
