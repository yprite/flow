import { SEO_INTENT_PAGES, getSeoIntentBySlug } from '../seo-intents'

describe('SEO_INTENT_PAGES', () => {
  it('covers required W1 P0 SEO landing set', () => {
    const slugs = SEO_INTENT_PAGES.map(page => page.slug)

    expect(slugs).toEqual(
      expect.arrayContaining([
        'bitcoin-fee-estimator',
        'bitcoin-address-lookup',
        'bitcoin-transaction-tracker',
      ])
    )
  })

  it('defines unique slugs', () => {
    const slugs = SEO_INTENT_PAGES.map(page => page.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('includes metadata and content for each intent page', () => {
    for (const intentPage of SEO_INTENT_PAGES) {
      expect(intentPage.title.length).toBeGreaterThan(10)
      expect(intentPage.description.length).toBeGreaterThan(30)
      expect(intentPage.primaryKeyword.length).toBeGreaterThan(3)
      expect(intentPage.keywordCluster.length).toBeGreaterThanOrEqual(3)
      expect(intentPage.useCases.length).toBeGreaterThanOrEqual(3)
      expect(intentPage.recommendedQuestions).toHaveLength(5)
      expect(intentPage.recommendedQuestions.every((question) => question.trim().length > 0)).toBe(true)
      expect(intentPage.faqs.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('getSeoIntentBySlug', () => {
  it('returns matching intent page', () => {
    const intentPage = getSeoIntentBySlug('bitcoin-address-lookup')
    expect(intentPage?.title).toContain('Bitcoin Address')
  })

  it('returns undefined for unknown slug', () => {
    const intentPage = getSeoIntentBySlug('unknown-slug')
    expect(intentPage).toBeUndefined()
  })
})
