import type { Metadata } from 'next'
import Link from 'next/link'
import { Gauge, MapPinned, Radar, TrendingDown } from 'lucide-react'
import { AdsenseSlot } from '@/components/adsense-slot'
import { OilNewsSection } from '@/components/oil-news-section'
import { PageViewTracker } from '@/components/page-view-tracker'
import { ServiceShareButton } from '@/components/service-share-button'
import { SiteFooter } from '@/components/site-footer'
import { getAdsenseSlot } from '@/lib/adsense'
import { GUIDES } from '@/lib/guides'
import { SEO_REGIONS } from '@/lib/regions'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.22),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#020617,_#0f172a_60%,_#111827)] text-white">
      <PageViewTracker path="/" metadata={{ pageType: 'landing' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
              <Gauge className="h-4 w-4" />
              {SITE_TAGLINE}
            </div>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-none tracking-tight md:text-7xl">
              오늘 기름값,
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-emerald-300 bg-clip-text text-transparent">
                비싼 데 갈 이유가 없습니다.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              {SITE_NAME}는 내 주변 최저가 주유소와 전국 평균 유가를 빠르게 비교하는
              검색 서비스입니다. 운전하기 전에 10초만 확인하면, 같은 연료도 덜 비싸게
              넣을 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/gas-finder"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-500/25 transition-transform hover:-translate-y-0.5"
              >
                지금 최저가 찾기
              </Link>
              <ServiceShareButton path="/" eventPath="/" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard value="즉시" label="핵심 비교 흐름" />
              <StatCard value="전국 평균" label="유종별 시세 확인" />
              <StatCard value="지도 이동" label="네이버·카카오·티맵 지원" />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/60 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<TrendingDown className="h-5 w-5 text-emerald-300" />}
                title="근처 최저가"
                description="현재 위치 기준으로 바로 비교하고, 반경을 바꿔서 싼 곳만 좁혀봅니다."
              />
              <FeatureCard
                icon={<Gauge className="h-5 w-5 text-amber-300" />}
                title="전국 평균 유가"
                description="오늘 체감 가격이 비싼지, 전국 평균과 비교해서 바로 감이 옵니다."
              />
              <FeatureCard
                icon={<Radar className="h-5 w-5 text-rose-300" />}
                title="브랜드 필터"
                description="SK, GS, S-OIL, 알뜰주유소까지 브랜드별로 다시 걸러볼 수 있습니다."
              />
              <FeatureCard
                icon={<MapPinned className="h-5 w-5 text-sky-300" />}
                title="지도 바로가기"
                description="네이버지도, 카카오맵, 티맵으로 바로 넘겨서 실제 이동까지 이어집니다."
              />
            </div>
          </div>
        </div>

        <OilNewsSection />

        <section className="rounded-[32px] border border-white/8 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                Region Intent Pages
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                지역 검색 유입을 받을 준비
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                서울, 부산, 인천처럼 주유 수요가 큰 지역은 바로 검색 화면으로 넘길 수
                있게 구성했습니다.
              </p>
            </div>
            <Link
              href="/gas-finder"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white"
            >
              전체 검색 화면 열기
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SEO_REGIONS.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="rounded-2xl border border-white/8 bg-slate-950/70 p-5 transition-transform hover:-translate-y-1 hover:border-amber-400/40"
              >
                <div className="text-sm font-semibold text-amber-200">{region.fullName}</div>
                <div className="mt-2 text-2xl font-black">{region.name} 기름값</div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{region.summary}</p>
                <div className="mt-4 text-xs text-slate-500">
                  {region.popularAreas.join(' · ')}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/8 bg-slate-950/70 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                Driver Guides
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                툴만 보고 끝내지 않도록, 판단 기준도 같이 제공합니다
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                평균 유가 해석, 장거리 주유 루틴, 알뜰주유소 비교처럼 실제 운전자
                의사결정에 필요한 가이드를 별도 콘텐츠로 정리했습니다.
              </p>
            </div>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-white"
            >
              전체 가이드 보기
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {GUIDES.slice(0, 3).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="rounded-2xl border border-white/8 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:border-emerald-400/40"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                  {guide.category}
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-tight">{guide.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{guide.description}</p>
                <div className="mt-5 text-sm font-semibold text-emerald-200">
                  {guide.readingTime} 읽기
                </div>
              </Link>
            ))}
          </div>
        </section>

        <AdsenseSlot slot={homeInlineAdSlot} />

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
              Why It Works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              주유 전에 필요한 정보만 남겼습니다.
            </h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <p>가격순과 거리순을 함께 제공해서, 싼 곳을 찾다가 오히려 더 멀리 가지 않게 합니다.</p>
              <p>브랜드 필터와 전국 평균 유가를 함께 보여줘서 체감 가격이 비싼지 바로 판단할 수 있습니다.</p>
              <p>결과 화면에서 바로 지도 앱으로 이동하므로 검색에서 행동까지의 마찰이 작습니다.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200/80">
              FAQ
            </p>
            <div className="mt-4 space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-white/8 bg-white/5 p-5">
                  <h3 className="text-lg font-bold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteFooter />
      </section>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-slate-900/80 p-2">
        {icon}
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/70 p-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  )
}
