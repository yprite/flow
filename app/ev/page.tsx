import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BatteryCharging,
  ChevronRight,
  Clock,
  MapPin,
  PlugZap,
  Zap,
} from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { GUIDES } from '@/lib/guides'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `전기차 충전 가이드 | ${SITE_NAME}`,
  description:
    '전기차 충전소 찾기, 충전 요금 비교, 충전 팁까지. 전기차 운전자를 위한 실용 가이드를 제공합니다.',
  keywords: [
    '전기차 충전소',
    '전기차 충전 요금',
    'EV 충전',
    '전기차 충전 팁',
    '급속 충전',
    '완속 충전',
    '전기차 충전소 찾기',
  ],
  alternates: {
    canonical: '/ev',
  },
  openGraph: {
    title: `전기차 충전 가이드 | ${SITE_NAME}`,
    description:
      '전기차 충전소 찾기, 충전 요금 비교, 충전 팁까지. 전기차 운전자를 위한 실용 가이드를 제공합니다.',
    url: absoluteUrl('/ev'),
    type: 'website',
  },
}

const evTips = [
  {
    icon: PlugZap,
    title: '급속 vs 완속, 상황별 선택',
    description:
      '급속 충전은 30분 내 80%까지 채울 수 있어 이동 중에 유리하고, 완속 충전은 집이나 직장에서 저렴하게 채우기 좋습니다.',
    accent: 'text-amber-300',
  },
  {
    icon: Clock,
    title: '충전 시간대별 요금 차이',
    description:
      '공공 충전소는 시간대별 요금 차이가 있을 수 있습니다. 심야 시간대(23시~09시)에 충전하면 전기 요금을 절약할 수 있습니다.',
    accent: 'text-emerald-300',
  },
  {
    icon: BatteryCharging,
    title: '배터리 관리 팁',
    description:
      '배터리 수명을 위해 20~80% 범위로 충전하는 습관을 들이면 장기적으로 효율이 좋습니다. 급속 충전은 필요할 때만 사용하세요.',
    accent: 'text-sky-300',
  },
  {
    icon: MapPin,
    title: '충전소 위치 미리 확인',
    description:
      '장거리 이동 전에는 경로 상의 충전소 위치와 충전기 종류(CCS, 차데모, AC)를 미리 확인해 두면 불안감이 줄어듭니다.',
    accent: 'text-rose-300',
  },
]

const evFaqItems = [
  {
    question: '전기차 충전 요금은 얼마나 드나요?',
    answer:
      '공공 급속 충전 기준 kWh당 약 300~350원 수준이며, 완속 충전은 그보다 저렴합니다. 가정용 충전기를 사용하면 심야 전기 요금으로 더 절약할 수 있습니다.',
  },
  {
    question: '급속 충전과 완속 충전의 차이는 무엇인가요?',
    answer:
      '급속 충전(50kW 이상)은 약 30~40분에 80%까지 충전하며, 완속 충전(7kW)은 6~8시간이 걸립니다. 급속은 이동 중, 완속은 주차 중 사용하기 적합합니다.',
  },
  {
    question: '충전소는 어떻게 찾나요?',
    answer:
      '환경부 무공해차 통합누리집, 한국전력 충전인프라 앱, 네이버지도, 카카오맵 등에서 실시간 충전소 위치와 사용 가능 여부를 확인할 수 있습니다.',
  },
]

const chargingProviders = [
  { name: '환경부(한국환경공단)', type: '공공', speed: '급속/완속' },
  { name: '한국전력(KEPCO)', type: '공공', speed: '급속/완속' },
  { name: '해피차저', type: '민간', speed: '급속/완속' },
  { name: 'SK시그넷', type: '민간', speed: '급속' },
  { name: '차지비', type: '민간', speed: '급속/완속' },
  { name: '에버온', type: '민간', speed: '급속/완속' },
]

export default function EvPage() {
  const evGuides = GUIDES.filter((g) => g.category === '전기차 가이드')
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: evFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(180deg,_#020617,_#0f172a_60%,_#111827)] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            홈
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>전기차 충전 가이드</span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sm text-sky-200">
            <Zap className="h-4 w-4" />
            전기차 운전자를 위한 충전 가이드
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-none tracking-tight md:text-7xl">
            전기차 충전,
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              똑똑하게 시작하세요.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            충전소 찾기부터 요금 비교, 배터리 관리까지. 전기차 운전에 필요한 실용
            정보를 한곳에 모았습니다.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/60 backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            {evTips.map((tip) => {
              const Icon = tip.icon

              return (
                <div
                  key={tip.title}
                  className="rounded-2xl border border-white/8 bg-white/5 p-4"
                >
                  <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-slate-900/80 p-2">
                    <Icon className={`h-5 w-5 ${tip.accent}`} />
                  </div>
                  <h2 className="text-lg font-bold">{tip.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {tip.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <section className="rounded-[32px] border border-white/8 bg-white/5 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200/80">
            Charging Providers
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            주요 충전 사업자
          </h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            국내 주요 전기차 충전 사업자를 한눈에 확인하세요. 공공과 민간
            사업자마다 요금과 충전 속도가 다릅니다.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {chargingProviders.map((provider) => (
              <div
                key={provider.name}
                className="rounded-2xl border border-white/8 bg-slate-950/70 p-5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      provider.type === '공공'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-amber-500/20 text-amber-200'
                    }`}
                  >
                    {provider.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {provider.speed}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{provider.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {evGuides.length > 0 ? (
          <section className="rounded-[32px] border border-white/8 bg-slate-950/70 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
              EV Guides
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              전기차 운전자 가이드
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {evGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="rounded-2xl border border-white/8 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:border-sky-400/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/80">
                    {guide.category}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight">
                    {guide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {guide.description}
                  </p>
                  <div className="mt-5 text-sm font-semibold text-sky-200">
                    {guide.readingTime} 읽기
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200/80">
              EV Basics
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              전기차 충전, 알아두면 좋은 기본
            </h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <p>
                전기차 충전 커넥터는 DC 콤보(CCS1), 차데모, AC 3상 등이 있으며,
                차량에 맞는 커넥터를 확인해야 합니다.
              </p>
              <p>
                공공 충전소는 환경부와 한국전력이 운영하며, 민간 충전소는 해피차저,
                에버온 등 다양한 사업자가 있습니다.
              </p>
              <p>
                충전 카드 하나로 여러 사업자의 충전소를 이용할 수 있는 로밍
                서비스도 점점 확대되고 있습니다.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200/80">
              FAQ
            </p>
            <div className="mt-4 space-y-4">
              {evFaqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-white/8 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-bold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/gas-finder"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            주유소 최저가도 보기
          </Link>
          <Link
            href="/guides"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            전체 가이드 보기
          </Link>
        </div>

        <SiteFooter />
      </section>
    </main>
  )
}
