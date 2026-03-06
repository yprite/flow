import type { MetadataRoute } from 'next'
import { SEO_INTENT_PAGES } from '@/lib/seo-intents'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-three-sigma.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/bitcoin`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...SEO_INTENT_PAGES.map((intentPage) => ({
      url: `${siteUrl}/bitcoin/${intentPage.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
