'use client'

import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics-client'

export function PageViewTracker({
  path,
  metadata,
}: {
  path: string
  metadata?: Record<string, unknown>
}) {
  const metadataKey = JSON.stringify(metadata || {})

  useEffect(() => {
    trackPageView(path, metadataKey ? JSON.parse(metadataKey) : undefined)
  }, [metadataKey, path])

  return null
}
