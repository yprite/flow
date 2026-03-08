import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export function SiteFooter({
  className = '',
}: {
  className?: string
}) {
  return (
    <footer className={`border-t border-white/8 pt-8 text-sm text-slate-400 ${className}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <p className="text-base font-bold text-slate-200">{SITE_NAME}</p>
          <p className="mt-2 leading-6">
            기름값 헌터는 내 주변 최저가 주유소와 전국 평균 유가를 빠르게 비교하기 위한
            정보 서비스입니다.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            데이터 출처: 한국석유공사 오피넷. 외부 가격 정보는 실제 현장 상황과 차이가
            있을 수 있습니다.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:text-right">
          <Link href="/guides" className="hover:text-white">
            가이드
          </Link>
          <Link href="/about" className="hover:text-white">
            서비스 소개
          </Link>
          <Link href="/contact" className="hover:text-white">
            문의
          </Link>
          <Link href="/privacy" className="hover:text-white">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-white">
            이용약관
          </Link>
        </nav>
      </div>
    </footer>
  )
}
