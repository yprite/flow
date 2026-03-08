import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MapPinned, Sparkles, TrendingDown } from 'lucide-react'
import { PageViewTracker } from '@/components/page-view-tracker'
import { ServiceShareButton } from '@/components/service-share-button'
import { SEO_REGIONS, getSeoRegion } from '@/lib/regions'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export function generateStaticParams() {
  return SEO_REGIONS.map((region) => ({ slug: region.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const region = getSeoRegion(slug)
  if (!region) return {}

  const title = `${region.name} 기름값 찾기 | ${SITE_NAME}`
  const description = `${region.fullName} 기준으로 근처 최저가 주유소와 평균 기름값을 빠르게 비교하세요. ${region.popularAreas.join(', ')} 운전자 검색 의도에 맞춘 랜딩입니다.`
  const path = `/regions/${region.slug}`

  return {
    title,
    description,
    keywords: [
      `${region.name} 기름값`,
      `${region.name} 주유소`,
      `${region.name} 휘발유 가격`,
      `${region.name} 경유 가격`,
      '주유소 최저가',
    ],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function RegionIntentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const region = getSeoRegion((await params).slug)
  if (!region) notFound()

  const finderHref = {
    pathname: '/gas-finder',
    query: {
      lat: region.latitude.toString(),
      lng: region.longitude.toString(),
      label: region.centerLabel,
      fuel: 'B027',
      radius: region.radius.toString(),
      preset: region.slug,
    },
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `${region.name} 기름값`,
            item: absoluteUrl(`/regions/${region.slug}`),
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `${region.name}에서 기름값 헌터로 무엇을 확인할 수 있나요?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${region.fullName} 중심 좌표를 미리 불러와 반경별 최저가 주유소와 브랜드별 가격 차이를 빠르게 확인할 수 있습니다.`,
            },
          },
          {
            '@type': 'Question',
            name: `${region.name} 기름값 페이지를 만든 이유는 무엇인가요?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${region.name}처럼 차량 이동 수요가 큰 지역은 '근처 싼 주유소' 검색 의도가 분명하기 때문에, 바로 검색 화면으로 연결되는 지역 랜딩이 효율적입니다.`,
            },
          },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#020617,_#111827_55%,_#1e293b)] text-white">
      <PageViewTracker
        path={`/regions/${region.slug}`}
        metadata={{ pageType: 'region-intent', region: region.slug }}
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
          <span>{region.name} 기름값</span>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/8 bg-white/5 p-6 backdrop-blur md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
            <Sparkles className="h-4 w-4" />
            {region.fullName} 인텐트 랜딩
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {region.name}에서
            <br />
            비싼 주유소를 피하는 가장 빠른 방법
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {region.summary} {region.popularAreas.join(', ')}처럼 이동량이 많은 생활권을
            기준으로, 최저가 주유소를 바로 확인할 수 있게 구성했습니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={finderHref}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-500/25"
            >
              {region.centerLabel} 기준으로 바로 검색
            </Link>
            <ServiceShareButton
              path={`/regions/${region.slug}`}
              title={`${region.name} 기름값 찾기 | ${SITE_NAME}`}
              text={`${region.name}에서 근처 최저가 주유소 찾을 때 쓰는 페이지`}
              eventPath={`/regions/${region.slug}`}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <IntentCard
            icon={<TrendingDown className="h-5 w-5 text-emerald-300" />}
            title={`${region.name} 최저가 탐색`}
            description="가격순으로 먼저 보고, 거리순으로 다시 정렬해서 실제 이동 비용까지 감안합니다."
          />
          <IntentCard
            icon={<MapPinned className="h-5 w-5 text-sky-300" />}
            title="지도 앱 바로 연결"
            description="네이버지도, 카카오맵, 티맵 링크가 바로 붙어 있어 검색 후 이동까지 끊기지 않습니다."
          />
          <IntentCard
            icon={<Sparkles className="h-5 w-5 text-amber-300" />}
            title="브랜드 필터 재비교"
            description="자주 가는 브랜드가 있다면 한 번 더 걸러서 선택지를 줄일 수 있습니다."
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <h2 className="text-2xl font-black tracking-tight">{region.name} 검색 의도에 맞춘 활용 방식</h2>
            <div className="mt-4 space-y-4 text-slate-300">
              <p>
                "{region.name} 기름값", "{region.name} 휘발유 가격", "{region.name} 싼
                주유소"처럼 검색하는 사용자는 당장 어디서 넣을지 결정하려는 경우가 많습니다.
              </p>
              <p>
                그래서 이 페이지는 설명보다 행동을 앞에 둡니다. {region.centerLabel}
                기준 좌표를 미리 넣고 검색 화면으로 보내기 때문에 첫 클릭 이후 바로 결과를
                확인할 수 있습니다.
              </p>
              <p>
                특히 {region.popularAreas.join(', ')}처럼 생활권 이동이 잦은 지역은 반경
                3km 안에서도 가격 차이가 발생하므로 검색 가치가 큽니다.
              </p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <h2 className="text-2xl font-black tracking-tight">이 페이지가 다루는 키워드</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                `${region.name} 기름값`,
                `${region.name} 주유소 가격 비교`,
                `${region.name} 휘발유 가격`,
                `${region.name} 경유 가격`,
                `${region.name} 싼 주유소`,
                `${region.name} 알뜰주유소`,
              ].map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function IntentCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-slate-950/70 p-5">
      <div className="mb-3 inline-flex rounded-xl border border-white/8 bg-white/5 p-2">{icon}</div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}
