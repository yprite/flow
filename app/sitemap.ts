import type { MetadataRoute } from 'next'
import { GUIDES } from '@/lib/guides'
import { SEO_REGIONS } from '@/lib/regions'
import { absoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/gas-finder'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/guides'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/about'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/contact'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/privacy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const regionRoutes: MetadataRoute.Sitemap = SEO_REGIONS.map((region) => ({
    url: absoluteUrl(`/regions/${region.slug}`),
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...regionRoutes, ...guideRoutes]
}
