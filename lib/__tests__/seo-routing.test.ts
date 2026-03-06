import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { PERFORMANCE_GUARDRAILS } from '../performance-guardrails'
import { SEO_INTENT_PAGES } from '../seo-intents'

describe('sitemap', () => {
  it('covers index and all intent pages', () => {
    const entries = sitemap()
    const urls = entries.map(entry => entry.url)

    expect(urls).toContain('https://flow-three-sigma.vercel.app/')
    expect(urls).toContain('https://flow-three-sigma.vercel.app/bitcoin')

    for (const intentPage of SEO_INTENT_PAGES) {
      expect(urls).toContain(`https://flow-three-sigma.vercel.app/bitcoin/${intentPage.slug}`)
    }
  })
})

describe('robots', () => {
  it('exposes sitemap and allows crawling', () => {
    const policy = robots()

    expect(policy.sitemap).toBe('https://flow-three-sigma.vercel.app/sitemap.xml')
    expect(policy.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: '*',
          allow: '/',
        }),
      ])
    )
  })
})

describe('performance guardrails', () => {
  it('includes core web vitals and JS budget thresholds', () => {
    const metrics = PERFORMANCE_GUARDRAILS.map(guardrail => guardrail.metric)

    expect(metrics).toEqual(
      expect.arrayContaining(['LCP', 'INP', 'CLS', 'JS Budget'])
    )
    expect(PERFORMANCE_GUARDRAILS).toHaveLength(4)
  })
})
