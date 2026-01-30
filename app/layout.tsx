import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "일정비서 사업 대시보드",
  description: "일정비서 사업 진행 현황 모니터링 대시보드",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
