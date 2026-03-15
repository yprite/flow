import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `오프라인 | ${SITE_NAME}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_32%),linear-gradient(180deg,_#020617,_#111827_60%,_#0f172a)] text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 md:px-6">
        <div className="w-full rounded-[32px] border border-white/8 bg-slate-950/75 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
            <WifiOff className="h-4 w-4" />
            Offline Mode
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            지금은 인터넷 연결이 없습니다.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            설치형으로 열어 둔 기본 화면은 유지되지만, 실시간 주유소 검색과 평균 유가
            조회는 연결이 복구되어야 다시 가져올 수 있습니다.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-500/20"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-base font-semibold text-slate-100"
            >
              저장된 가이드 열기
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-white/8 bg-white/5 p-5 text-sm leading-7 text-slate-300">
            연결이 복구되면 다시 검색 화면으로 돌아가 주변 최저가를 조회해 주세요.
            설치 후에는 홈 화면에서 더 빠르게 다시 열 수 있습니다.
          </div>
        </div>
      </section>
    </main>
  )
}
