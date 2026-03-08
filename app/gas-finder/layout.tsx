import type { Metadata } from 'next'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `근처 최저가 주유소 검색 | ${SITE_NAME}`,
  description:
    '현재 위치 기준으로 최저가 주유소, 전국 평균 유가, 브랜드별 가격 차이를 빠르게 비교해 보세요.',
  keywords: [
    '근처 최저가 주유소',
    '주유소 가격 비교',
    '휘발유 가격',
    '경유 가격',
    '전국 평균 유가',
  ],
  alternates: {
    canonical: '/gas-finder',
  },
  openGraph: {
    title: `근처 최저가 주유소 검색 | ${SITE_NAME}`,
    description:
      '현재 위치 기준으로 최저가 주유소, 전국 평균 유가, 브랜드별 가격 차이를 빠르게 비교해 보세요.',
    url: absoluteUrl('/gas-finder'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `근처 최저가 주유소 검색 | ${SITE_NAME}`,
    description:
      '현재 위치 기준으로 최저가 주유소, 전국 평균 유가, 브랜드별 가격 차이를 빠르게 비교해 보세요.',
  },
}

export default function GasFinderLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/gas-finder'),
    description:
      '현재 위치 기준으로 최저가 주유소, 전국 평균 유가, 브랜드별 가격 차이를 빠르게 비교하는 웹 앱입니다.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
}
