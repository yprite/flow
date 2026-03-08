import type { Metadata } from 'next'
import './globals.css'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
} from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} - 주유소 최저가 검색기`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 주유소 최저가 검색기`,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl('/'),
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - 주유소 최저가 검색기`,
    description: DEFAULT_DESCRIPTION,
  },
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
