import { AnalyticsEvent } from '../types'
import {
  buildGrowthDashboard,
  validateEventAgainstTaxonomy,
} from '../analytics-service'

function createEvents(): AnalyticsEvent[] {
  return [
    {
      id: 'l1',
      eventName: 'landing_viewed',
      userId: 'u1',
      occurredAt: '2026-01-09T00:00:00.000Z',
      source: 'web',
      properties: { channel: 'seo', landingPage: '/bitcoin-fee-estimator' },
    },
    {
      id: '1',
      eventName: 'signup_completed',
      userId: 'u1',
      occurredAt: '2026-01-10T00:00:00.000Z',
      source: 'web',
      properties: { channel: 'seo', plan: 'free' },
    },
    {
      id: '2',
      eventName: 'first_query_completed',
      userId: 'u1',
      occurredAt: '2026-01-12T00:00:00.000Z',
      source: 'web',
      properties: { queryType: 'wallet-balance' },
    },
    {
      id: '3',
      eventName: 'session_started',
      userId: 'u1',
      occurredAt: '2026-02-03T12:00:00.000Z',
      source: 'web',
      properties: { channel: 'direct' },
    },
    {
      id: '4',
      eventName: 'query_executed',
      userId: 'u1',
      occurredAt: '2026-02-18T12:00:00.000Z',
      source: 'web',
      properties: { queryType: 'wallet-balance' },
    },
    {
      id: 'l2',
      eventName: 'landing_viewed',
      userId: 'u2',
      occurredAt: '2026-01-14T00:00:00.000Z',
      source: 'web',
      properties: { channel: 'ads', landingPage: '/bitcoin-address-lookup' },
    },
    {
      id: '5',
      eventName: 'signup_completed',
      userId: 'u2',
      occurredAt: '2026-01-15T00:00:00.000Z',
      source: 'web',
      properties: { channel: 'ads', plan: 'free' },
    },
    {
      id: '6',
      eventName: 'session_started',
      userId: 'u2',
      occurredAt: '2026-02-12T12:00:00.000Z',
      source: 'web',
      properties: { channel: 'ads' },
    },
    {
      id: 'l3',
      eventName: 'landing_viewed',
      userId: 'u3',
      occurredAt: '2026-02-17T00:00:00.000Z',
      source: 'web',
      properties: { channel: 'seo', landingPage: '/mempool-tracker' },
    },
    {
      id: '7',
      eventName: 'signup_completed',
      userId: 'u3',
      occurredAt: '2026-02-18T00:00:00.000Z',
      source: 'web',
      properties: { channel: 'seo', plan: 'pro' },
    },
    {
      id: '8',
      eventName: 'first_query_completed',
      userId: 'u3',
      occurredAt: '2026-02-19T00:00:00.000Z',
      source: 'web',
      properties: { queryType: 'tx-lookup' },
    },
    {
      id: 'l4',
      eventName: 'landing_viewed',
      userId: 'u5',
      occurredAt: '2026-02-18T01:00:00.000Z',
      source: 'web',
      properties: { channel: 'referral', landingPage: '/bitcoin-rich-list' },
    },
    {
      id: '9',
      eventName: 'session_started',
      userId: 'u4',
      occurredAt: '2026-02-24T12:00:00.000Z',
      source: 'web',
      properties: { channel: 'direct' },
    },
  ]
}

describe('validateEventAgainstTaxonomy', () => {
  it('returns an error when required properties are missing', () => {
    const errors = validateEventAgainstTaxonomy({
      eventName: 'signup_completed',
      properties: { plan: 'free' },
    })

    expect(errors).toContain('properties.channel is required')
  })

  it('returns no errors for a valid event', () => {
    const errors = validateEventAgainstTaxonomy({
      eventName: 'first_query_completed',
      properties: { queryType: 'mempool-depth' },
    })

    expect(errors).toEqual([])
  })
})

describe('buildGrowthDashboard', () => {
  it('calculates weekly MAU trend', () => {
    const dashboard = buildGrowthDashboard(createEvents(), {
      weeks: 4,
      referenceDate: new Date('2026-02-23T12:00:00.000Z'),
    })

    const mauByWeek = dashboard.weeklyMauTrend.map(point => point.mau)
    expect(mauByWeek).toEqual([1, 1, 2, 1])
  })

  it('calculates activation and D30 retention baseline', () => {
    const dashboard = buildGrowthDashboard(createEvents(), {
      referenceDate: new Date('2026-02-23T12:00:00.000Z'),
    })

    expect(dashboard.activation.signupUsers).toBe(3)
    expect(dashboard.activation.activatedUsers).toBe(2)
    expect(dashboard.activation.rate).toBe(66.7)

    expect(dashboard.retention.eligibleUsers).toBe(2)
    expect(dashboard.retention.retainedUsers).toBe(1)
    expect(dashboard.retention.d30Rate).toBe(50)
  })

  it('identifies top onboarding drop-off and reports shipped improvements', () => {
    const dashboard = buildGrowthDashboard(createEvents(), {
      referenceDate: new Date('2026-02-23T12:00:00.000Z'),
      improvements: [
        {
          id: 'fix-1',
          title: 'Fix 1',
          change: 'Improvement 1',
          metric: 'first session completion',
          before: 30,
          after: 40,
          sampleSize: 100,
          windowDays: 14,
        },
        {
          id: 'fix-2',
          title: 'Fix 2',
          change: 'Improvement 2',
          metric: '7-day return',
          before: 20,
          after: 38,
          sampleSize: 200,
          windowDays: 14,
        },
      ],
    })

    expect(dashboard.onboarding.funnel.topDropOffStep?.id).toBe('seven_day_return')
    expect(dashboard.onboarding.improvements[0].id).toBe('fix-2')
  })
})
