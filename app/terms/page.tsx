import type { Metadata } from 'next'
import { InfoPageShell } from '@/components/info-page-shell'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `이용약관 | ${SITE_NAME}`,
  description: '기름값 헌터 서비스 이용 시 적용되는 기본 약관과 면책 범위를 안내합니다.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: `이용약관 | ${SITE_NAME}`,
    description: '기름값 헌터 서비스 이용 시 적용되는 기본 약관과 면책 범위를 안내합니다.',
    url: absoluteUrl('/terms'),
    type: 'article',
  },
}

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Terms"
      title="이용약관"
      description="기름값 헌터는 정보 제공을 목적으로 운영되며, 아래 기본 약관은 서비스 이용 전반에 적용됩니다."
    >
      <Rule
        title="서비스 성격"
        body="본 서비스는 주유소 가격 비교와 관련 정보 제공을 목적으로 하며, 특정 주유소 이용을 강제하거나 보장하지 않습니다."
      />
      <Rule
        title="가격 정보의 한계"
        body="주유소 가격과 평균 유가 데이터는 외부 데이터 출처를 기반으로 제공됩니다. 실제 현장 가격, 재고, 영업 상태, 서비스 품질과 차이가 있을 수 있으며, 사용자는 최종 판단 책임을 스스로 부담합니다."
      />
      <Rule
        title="외부 링크"
        body="서비스는 사용 편의를 위해 외부 지도 및 외부 뉴스 링크를 제공할 수 있습니다. 외부 사이트로 이동한 이후의 행위와 정보는 해당 사이트의 정책과 책임에 따릅니다."
      />
      <Rule
        title="서비스 변경"
        body="운영자는 서비스 개선, 정책 변경, 데이터 출처 변경 등의 사유로 일부 기능을 수정, 중단 또는 제거할 수 있습니다."
      />
      <Rule
        title="금지 행위"
        body="비정상 트래픽 생성, 서비스 방해, 자동화된 과도한 요청, 허위 클릭 유도 등 정상적인 서비스 운영을 침해하는 행위는 금지됩니다."
      />
    </InfoPageShell>
  )
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{body}</p>
    </section>
  )
}
