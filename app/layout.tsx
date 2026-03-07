import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '기름값 헌터 - 주유소 최저가 검색기',
  description:
    '월급은 통장을 스쳐가고... 기름값은 지갑을 관통한다. 내 주변 최저가 주유소를 찾아보세요.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
