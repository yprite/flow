import { getAdsensePublisherId } from '@/lib/adsense'

const ADSENSE_CERT_ID = 'f08c47fec0942fa0'
const MISSING_ADSENSE_MESSAGE =
  '# AdSense publisher ID is not configured yet.\n'

export async function GET() {
  const publisherId = getAdsensePublisherId()
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, ${ADSENSE_CERT_ID}\n`
    : MISSING_ADSENSE_MESSAGE

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
