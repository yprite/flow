import type { Metadata } from 'next'
import { RoadJourneyLanding } from '@/components/road-journey-landing'
import { getAdsenseSlot } from '@/lib/adsense'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
} from '@/lib/site'

const faqItems = [
  {
    question: '기름값 헌터로 무엇을 바로 확인할 수 있나요?',
    answer:
      '내 주변 최저가 주유소, 전국 평균 유가, 브랜드별 가격 차이, 지도 이동 링크를 한 화면에서 바로 확인할 수 있습니다.',
  },
  {
    question: '서울이나 부산처럼 지역별로도 바로 볼 수 있나요?',
    answer:
      '지역 인텐트 페이지에서 도시 중심 좌표를 미리 넣어 두었기 때문에, 버튼 한 번으로 해당 도시 기준 검색 화면으로 이동할 수 있습니다.',
  },
  {
    question: '데이터는 어디에서 오나요?',
    answer:
      '주유소 가격과 평균 유가 데이터는 한국석유공사 오피넷 API를 기반으로 조회합니다.',
  },
]

export const metadata: Metadata = {
  title: `${SITE_NAME} | 근처 최저가 주유소 검색`,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} | 근처 최저가 주유소 검색`,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl('/'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | 근처 최저가 주유소 검색`,
    description: DEFAULT_DESCRIPTION,
  },
}

export default function HomePage() {
  const homeInlineAdSlot = getAdsenseSlot('homeInline')
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: absoluteUrl('/'),
        description: DEFAULT_DESCRIPTION,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RoadJourneyLanding
        homeInlineAdSlot={homeInlineAdSlot}
        faqItems={faqItems}
      />
    </>
  )
}
