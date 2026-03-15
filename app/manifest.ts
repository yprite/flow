import type { MetadataRoute } from 'next'
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  const shortcutIcons = [
    {
      src: '/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
    },
  ]

  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    orientation: 'portrait',
    lang: 'ko-KR',
    categories: ['utilities', 'navigation', 'travel'],
    shortcuts: [
      {
        name: '최저가 찾기',
        short_name: '최저가',
        description: '내 주변 최저가 주유소를 바로 검색합니다.',
        url: '/gas-finder?shortcut=finder',
        icons: shortcutIcons,
      },
      {
        name: '경유 빠른 검색',
        short_name: '경유 3km',
        description: '경유 가격순 기준으로 빠르게 검색합니다.',
        url: '/gas-finder?fuel=D047&radius=3000&sort=1&shortcut=diesel',
        icons: shortcutIcons,
      },
      {
        name: '서울 기준 검색',
        short_name: '서울',
        description: '서울시청 기준 휘발유 최저가를 바로 확인합니다.',
        url: `/gas-finder?lat=37.5665&lng=126.978&label=${encodeURIComponent('서울시청')}&fuel=B027&radius=3000&preset=seoul&shortcut=seoul`,
        icons: shortcutIcons,
      },
    ],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
