import { getAdsenseClientId } from '@/lib/adsense'
import { AdsenseSlotClient } from '@/components/adsense-slot-client'

export function AdsenseSlot({
  slot,
  className = '',
}: {
  slot: string | null
  className?: string
}) {
  const clientId = getAdsenseClientId()

  if (!slot || !clientId) return null

  return <AdsenseSlotClient clientId={clientId} slot={slot} className={className} />
}
