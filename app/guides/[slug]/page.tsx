import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpenText, ChevronRight } from 'lucide-react'
import { AdsenseSlot } from '@/components/adsense-slot'
import { PageViewTracker } from '@/components/page-view-tracker'
import { SiteFooter } from '@/components/site-footer'
import { getAdsenseSlot } from '@/lib/adsense'
import { GUIDES, getGuide } from '@/lib/guides'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}

  const path = `/guides/${guide.slug}`
  return {
    title: `${guide.title} | ${SITE_NAME}`,
    description: guide.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${guide.title} | ${SITE_NAME}`,
      description: guide.description,
      url: absoluteUrl(path),
      type: 'article',
    },
  }
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()
  const guideDetailInlineAdSlot = getAdsenseSlot('guideDetailInline')

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        author: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
        url: absoluteUrl(`/guides/${guide.slug}`),
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#020617,_#111827_55%,_#1e293b)] text-white">
      <PageViewTracker
        path={`/guides/${guide.slug}`}
        metadata={{ pageType: 'guide-detail', guideSlug: guide.slug }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            홈
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/guides" className="hover:text-white">
            가이드
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{guide.title}</span>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/8 bg-white/5 p-6 backdrop-blur md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
            <BookOpenText className="h-4 w-4" />
            {guide.category}
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{guide.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{guide.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {guide.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
              >
                {highlight}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href={guide.ctaHref}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-500/25"
            >
              {guide.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {guide.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6"
            >
              <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <AdsenseSlot slot={guideDetailInlineAdSlot} className="mt-8" />

        <section className="mt-8 rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
          <h2 className="text-2xl font-black tracking-tight">자주 묻는 질문</h2>
          <div className="mt-5 space-y-4">
            {guide.faq.map((item) => (
              <div key={item.question} className="rounded-2xl border border-white/8 bg-white/5 p-5">
                <h3 className="text-lg font-bold">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                Related Guides
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">다음에 읽을 가이드</h2>
            </div>
            <Link href="/guides" className="text-sm font-semibold text-amber-200 hover:text-white">
              전체 가이드 보기
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {GUIDES.filter((item) => item.slug !== guide.slug)
              .slice(0, 2)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/guides/${item.slug}`}
                  className="rounded-2xl border border-white/8 bg-white/5 p-5 hover:border-amber-400/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                    {item.category}
                  </p>
                  <h3 className="mt-3 text-xl font-black tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                </Link>
              ))}
          </div>
        </section>

        <SiteFooter className="mt-12" />
      </section>
    </main>
  )
}
