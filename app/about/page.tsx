import type { Metadata } from 'next'
import { InfoPageShell } from '@/components/info-page-shell'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `서비스 소개 | ${SITE_NAME}`,
  description:
    '기름값 헌터의 목적, 데이터 출처, 제공 방식과 서비스가 어떤 문제를 해결하는지 안내합니다.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `서비스 소개 | ${SITE_NAME}`,
    description:
      '기름값 헌터의 목적, 데이터 출처, 제공 방식과 서비스가 어떤 문제를 해결하는지 안내합니다.',
    url: absoluteUrl('/about'),
    type: 'article',
  },
}

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About"
      title="서비스 소개"
      description="기름값 헌터는 운전자가 주유 전에 빠르게 가격을 비교하고, 불필요하게 비싼 주유소를 피할 수 있도록 만든 정보 서비스입니다."
    >
      <Section
        title="무엇을 해결하나요?"
        body="같은 지역 안에서도 주유소 가격 차이가 발생합니다. 기름값 헌터는 현재 위치 또는 지정 지역 기준으로 최저가 주유소를 비교하고, 전국 평균 유가와 브랜드별 가격 차이를 함께 보여줘 사용자의 판단 시간을 줄입니다."
      />
      <Section
        title="데이터는 어디에서 오나요?"
        body="주유소 가격과 평균 유가 데이터는 한국석유공사 오피넷 API를 기반으로 조회합니다. 검색 시점의 응답과 실제 현장 상황은 차이가 있을 수 있으며, 서비스는 이를 정보 제공 목적으로 활용합니다."
      />
      <Section
        title="누구를 위한 서비스인가요?"
        body="출퇴근 자차 이용자, 장거리 운전자, 배달 및 영업 차량처럼 주유 빈도가 높은 사용자를 우선 대상으로 생각하고 설계했습니다. 특히 지역별 가격 차이가 큰 생활권에서 유용합니다."
      />
      <Section
        title="서비스 운영 원칙"
        body="광고보다 유용성을 우선합니다. 검색, 비교, 이동 같은 핵심 흐름을 방해하지 않는 범위에서만 정보 구조를 개선하며, 데이터 출처와 한계를 명확히 안내합니다."
      />
    </InfoPageShell>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{body}</p>
    </section>
  )
}
