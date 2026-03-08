'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics-client'
import { SITE_NAME } from '@/lib/site'

export function ServiceShareButton({
  path,
  title = SITE_NAME,
  text = '근처 최저가 주유소 찾을 때 바로 쓰는 기름값 비교 서비스',
  eventPath,
  className = '',
}: {
  path: string
  title?: string
  text?: string
  eventPath: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const [nativeShareSupported, setNativeShareSupported] = useState(false)

  useEffect(() => {
    setNativeShareSupported(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const handleShare = async () => {
    const url =
      typeof window === 'undefined'
        ? path
        : new URL(path, window.location.origin).toString()

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        trackEvent('share_click', eventPath, { channel: 'native', url })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      trackEvent('share_click', eventPath, { channel: 'clipboard', url })
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        trackEvent('share_click', eventPath, { channel: 'clipboard-fallback', url })
        window.setTimeout(() => setCopied(false), 1800)
      } catch {
        // Ignore share failures.
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          링크 복사됨
        </>
      ) : (
        <>
          {nativeShareSupported ? (
            <Share2 className="h-4 w-4 text-amber-400" />
          ) : (
            <Copy className="h-4 w-4 text-amber-400" />
          )}
          친구에게 공유
        </>
      )}
    </button>
  )
}
