export const SITE_NAME = '기름값 헌터'
export const SITE_TAGLINE = '근처 최저가 주유소와 전국 평균 유가를 한 번에'
export const DEFAULT_DESCRIPTION =
  '내 주변 최저가 주유소, 전국 평균 유가, 브랜드별 가격 차이를 빠르게 확인하는 한국형 주유소 가격 비교 서비스.'

export const DEFAULT_KEYWORDS = [
  '기름값',
  '주유소 가격 비교',
  '주유소 최저가',
  '휘발유 가격',
  '경유 가격',
  'LPG 가격',
  '근처 주유소',
  '오피넷',
  '전국 평균 유가',
  '전기차 충전소',
  '전기차 충전 요금',
  'EV 충전',
]

export function getSiteUrl() {
  const raw =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000'

  return raw.startsWith('http') ? raw : `https://${raw}`
}

export const SITE_URL = getSiteUrl()

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}
