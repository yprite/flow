import type { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'
import { InfoPageShell } from '@/components/info-page-shell'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

const REPO_ISSUES_URL = 'https://github.com/yprite/flow/issues'

export const metadata: Metadata = {
  title: `문의 | ${SITE_NAME}`,
  description: '기름값 헌터 관련 문의, 제안, 오류 제보 경로를 안내합니다.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: `문의 | ${SITE_NAME}`,
    description: '기름값 헌터 관련 문의, 제안, 오류 제보 경로를 안내합니다.',
    url: absoluteUrl('/contact'),
    type: 'article',
  },
}

export default function ContactPage() {
  return (
    <InfoPageShell
      eyebrow="Contact"
      title="문의"
      description="서비스 오류 제보, 기능 제안, 데이터 관련 문의는 아래 채널로 접수할 수 있습니다."
    >
      <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
        <h2 className="text-2xl font-black tracking-tight">문의 채널</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
          <p>
            현재 가장 확실한 문의 채널은 GitHub Issues입니다. 재현 경로, 사용 환경,
            문제가 발생한 지역 또는 유종 정보를 함께 남기면 확인이 빨라집니다.
          </p>
          <a
            href={REPO_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-800"
          >
            GitHub Issues로 문의하기
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
        <h2 className="text-2xl font-black tracking-tight">문의 시 포함하면 좋은 정보</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          <li>사용한 페이지와 기능 이름</li>
          <li>발생 시각과 대략적인 위치</li>
          <li>선택한 유종, 반경, 정렬 옵션</li>
          <li>오류 메시지 또는 기대한 결과와 실제 결과</li>
        </ul>
      </section>
    </InfoPageShell>
  )
}
