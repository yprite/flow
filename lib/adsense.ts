function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }

  return null
}

function normalizePublisherId(raw: string) {
  if (raw.startsWith('pub-')) return raw
  if (raw.startsWith('ca-pub-')) return raw.slice(3)
  if (/^\d+$/.test(raw)) return `pub-${raw}`

  return null
}

function normalizeClientId(raw: string) {
  if (raw.startsWith('ca-pub-')) return raw
  if (raw.startsWith('pub-')) return `ca-${raw}`
  if (/^\d+$/.test(raw)) return `ca-pub-${raw}`

  return null
}

export function getAdsensePublisherId() {
  const raw = readFirstEnv([
    'GOOGLE_ADSENSE_PUBLISHER_ID',
    'GOOGLE_ADSENSE_CLIENT_ID',
    'NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID',
  ])

  return raw ? normalizePublisherId(raw) : null
}

export function getAdsenseClientId() {
  const raw = readFirstEnv([
    'GOOGLE_ADSENSE_CLIENT_ID',
    'NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID',
    'GOOGLE_ADSENSE_PUBLISHER_ID',
  ])

  return raw ? normalizeClientId(raw) : null
}

export function getAdsenseSlot(
  slotName: 'homeInline' | 'guidesInline' | 'guideDetailInline'
) {
  const slotMap = {
    homeInline: [
      'GOOGLE_ADSENSE_SLOT_HOME_INLINE',
      'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HOME_INLINE',
    ],
    guidesInline: [
      'GOOGLE_ADSENSE_SLOT_GUIDES_INLINE',
      'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GUIDES_INLINE',
    ],
    guideDetailInline: [
      'GOOGLE_ADSENSE_SLOT_GUIDE_DETAIL_INLINE',
      'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GUIDE_DETAIL_INLINE',
    ],
  } as const

  return readFirstEnv([...slotMap[slotName]])
}
