import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE_URL = 'https://oil-hunter.kr'
const SITE_NAME = '기름값 헌터'
const TITLE = '기름값 헌터 - 주유소 최저가 검색기'
const DESCRIPTION =
  '내 주변 최저가 주유소를 실시간으로 비교하세요. 휘발유, 경유, 고급유, LPG 가격을 한눈에!'

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    '주유소 가격',
    '기름값',
    '최저가 주유소',
    '주유소 검색',
    '휘발유 가격',
    '경유 가격',
    '유가 비교',
    'LPG 가격',
    '셀프 주유소',
    '오피넷',
  ],
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '기름값 헌터 - 내 주변 최저가 주유소 검색',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f43f5e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: SITE_NAME,
              url: SITE_URL,
              description: DESCRIPTION,
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
              },
              inLanguage: 'ko',
            }),
          }}
        />
      </body>
    </html>
  )
}
