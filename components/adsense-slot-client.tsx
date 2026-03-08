'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function AdsenseSlotClient({
  clientId,
  slot,
  className = '',
}: {
  clientId: string
  slot: string
  className?: string
}) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      initialized.current = true
    } catch {
      // Ignore ad fill failures so content pages keep rendering cleanly.
    }
  }, [])

  return (
    <aside
      aria-label="광고"
      className={`rounded-[28px] border border-white/8 bg-slate-950/70 p-5 ${className}`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        광고
      </p>
      <ins
        className="adsbygoogle block overflow-hidden rounded-2xl bg-white/5"
        style={{ display: 'block', minHeight: 280 }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
