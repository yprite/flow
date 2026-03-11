import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '내 주변 최저가 주유소 찾기',
  description:
    '현재 위치 기반으로 주변 최저가 주유소를 실시간 검색. 휘발유, 경유, 고급유, LPG 가격 비교.',
  alternates: {
    canonical: '/gas-finder',
  },
}

export default function GasFinderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
