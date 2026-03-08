import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpenText, ChevronRight } from 'lucide-react'
import { AdsenseSlot } from '@/components/adsense-slot'
import { PageViewTracker } from '@/components/page-view-tracker'
import { SiteFooter } from '@/components/site-footer'
import { getAdsenseSlot } from '@/lib/adsense'
import { GUIDES } from '@/lib/guides'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `가이드 | ${SITE_NAME}`,
  description:
    '기름값 비교, 지역별 주유 전략, 평균 유가 해석 등 운전자에게 필요한 가이드를 모아 둔 콘텐츠 허브입니다.',
  alternates: {
    canonical: '/guides',
  },
  openGraph: {
    title: `가이드 | ${SITE_NAME}`,
    description:
      '기름값 비교, 지역별 주유 전략, 평균 유가 해석 등 운전자에게 필요한 가이드를 모아 둔 콘텐츠 허브입니다.',
    url: absoluteUrl('/guides'),
    type: 'website',
  },
}

export default function GuidesIndexPage() {
  const guidesInlineAdSlot = getAdsenseSlot('guidesInline')

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#020617,_#111827_55%,_#1e293b)] text-white">
      <PageViewTracker path="/guides" metadata={{ pageType: 'guides-hub' }} />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            홈
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>가이드</span>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/8 bg-white/5 p-6 backdrop-blur md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
            <BookOpenText className="h-4 w-4" />
            Guide Hub
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            주유 전에 읽으면
            <br />
            판단이 빨라지는 가이드
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            기름값 헌터의 가이드는 검색 도구를 실제로 더 잘 쓰기 위한 맥락과 판단 기준을
            담고 있습니다. 툴 사용 전후에 바로 적용할 수 있는 운전자용 콘텐츠를
            모았습니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6 transition-transform hover:-translate-y-1 hover:border-amber-400/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                {guide.category}
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{guide.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {guide.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-slate-300">
                <span>{guide.readingTime}</span>
                <span className="text-amber-200">읽어보기</span>
              </div>
            </Link>
          ))}
        </div>

        <AdsenseSlot slot={guidesInlineAdSlot} className="mt-8" />

        <SiteFooter className="mt-12" />
      </section>
    </main>
  )
}
