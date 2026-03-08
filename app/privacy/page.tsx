import type { Metadata } from 'next'
import { InfoPageShell } from '@/components/info-page-shell'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `개인정보처리방침 | ${SITE_NAME}`,
  description: '기름값 헌터가 어떤 정보를 수집하고 어떻게 처리하는지 설명합니다.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: `개인정보처리방침 | ${SITE_NAME}`,
    description: '기름값 헌터가 어떤 정보를 수집하고 어떻게 처리하는지 설명합니다.',
    url: absoluteUrl('/privacy'),
    type: 'article',
  },
}

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy"
      title="개인정보처리방침"
      description="기름값 헌터는 서비스 운영과 품질 개선에 필요한 최소 범위의 정보만 처리하는 것을 원칙으로 합니다."
    >
      <Block
        title="수집하는 정보"
        body="서비스는 페이지 경로, 유입 경로, 브라우저 정보, 디바이스 유형, 세션 식별자, IP 기반 접속 정보 등 방문 분석에 필요한 정보를 처리할 수 있습니다. 이는 트래픽 분석과 오류 대응을 위한 용도입니다."
      />
      <Block
        title="위치 정보 처리"
        body="사용자가 브라우저 위치 권한을 허용하는 경우, 현재 위치 좌표는 주변 주유소 조회 요청을 위해 사용됩니다. 현재 위치 좌표는 검색 요청에 활용되며, 별도의 회원 프로필 정보로 저장하지 않습니다."
      />
      <Block
        title="데이터 사용 목적"
        body="수집 정보는 유입 분석, 서비스 품질 개선, 검색 흐름 최적화, 오류 재현 및 대응을 위해 사용됩니다. 광고 클릭 유도나 개별 사용자 식별을 위한 용도로 사용하지 않습니다."
      />
      <Block
        title="제3자 제공 및 외부 서비스"
        body="주유소 가격 정보는 한국석유공사 오피넷 API를 기반으로 조회합니다. 또한 외부 지도 서비스 링크를 통해 네이버지도, 카카오맵, 티맵 등으로 이동할 수 있습니다. 외부 서비스 이용 시에는 각 서비스의 정책이 적용됩니다."
      />
      <Block
        title="정책 변경"
        body="본 방침은 서비스 기능 또는 법적 요구사항 변화에 따라 수정될 수 있으며, 중요한 변경이 있는 경우 페이지를 통해 공지합니다."
      />
    </InfoPageShell>
  )
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{body}</p>
    </section>
  )
}
