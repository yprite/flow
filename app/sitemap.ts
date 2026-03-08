import type { MetadataRoute } from 'next'
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
  ]

  const regionRoutes: MetadataRoute.Sitemap = SEO_REGIONS.map((region) => ({
    url: absoluteUrl(`/regions/${region.slug}`),
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  return [...staticRoutes, ...regionRoutes]
}
