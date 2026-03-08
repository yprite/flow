'use client'

const SESSION_KEY = 'sid'

function getSessionId() {
  if (typeof window === 'undefined') return 'server'

  const existing = window.sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const next = Math.random().toString(36).slice(2) + Date.now().toString(36)
  window.sessionStorage.setItem(SESSION_KEY, next)
  return next
}

type AnalyticsPayload = {
  type?: 'page_view' | 'event'
  name?: string
  path: string
  referrer?: string
  metadata?: Record<string, unknown>
}

async function sendAnalytics(payload: AnalyticsPayload) {
  if (typeof window === 'undefined') return

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        referrer: payload.referrer || document.referrer || 'direct',
        sessionId: getSessionId(),
      }),
      keepalive: true,
    })
  } catch {
    // Analytics failures should never block the product path.
  }
}

export function trackPageView(path: string, metadata?: Record<string, unknown>) {
  return sendAnalytics({ type: 'page_view', path, metadata })
}

export function trackEvent(
  name: string,
  path: string,
  metadata?: Record<string, unknown>,
) {
  return sendAnalytics({ type: 'event', name, path, metadata })
}
