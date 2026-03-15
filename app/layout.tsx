import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { getAdsenseClientId } from '@/lib/adsense'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
} from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} - 주유소 최저가 검색기`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adsenseClientId = getAdsenseClientId()

  return (
    <html lang="ko">
      <head>
        {adsenseClientId ? (
          <meta name="google-adsense-account" content={adsenseClientId} />
        ) : null}
      </head>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegister />
        <PwaInstallPrompt />
        {adsenseClientId ? (
          <Script
            async
            crossOrigin="anonymous"
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  )
}
