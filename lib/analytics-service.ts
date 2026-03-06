import fs from 'fs'
import path from 'path'
import {
  ActivationImprovementMetric,
  AnalyticsEvent,
  AnalyticsEventDefinition,
  AnalyticsEventName,
  AnalyticsEventSource,
  AnalyticsPropertyValue,
  FunnelStepMetrics,
  GrowthDashboardData,
} from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_WEEKS = 8
const DEFAULT_ACTIVATION_WINDOW_DAYS = 7
const DEFAULT_RETENTION_START_DAYS = 30
const DEFAULT_RETENTION_WINDOW_DAYS = 30

export const TAXONOMY_VERSION = '2026-03-06'
export const ANALYTICS_DATA_PATH = path.join(process.cwd(), 'data', 'analytics-events.json')
export const ACTIVATION_IMPROVEMENTS_DATA_PATH = path.join(
  process.cwd(),
  'data',
  'activation-improvements.json'
)

type TaxonomyConfig = Omit<AnalyticsEventDefinition, 'name'>

export const EVENT_TAXONOMY: Record<AnalyticsEventName, TaxonomyConfig> = {
  landing_viewed: {
    category: 'acquisition',
    description: 'User landed on a growth page from an external channel.',
    requiredProperties: ['channel', 'landingPage'],
    activeForMau: false,
  },
  signup_completed: {
    category: 'acquisition',
    description: 'User finished account creation.',
    requiredProperties: ['channel', 'plan'],
    activeForMau: false,
  },
  first_query_completed: {
    category: 'activation',
    description: 'User successfully completed first on-chain query.',
    requiredProperties: ['queryType'],
    activeForMau: true,
  },
  session_started: {
    category: 'engagement',
    description: 'User started an authenticated product session.',
    requiredProperties: ['channel'],
    activeForMau: true,
  },
  query_executed: {
    category: 'retention',
    description: 'User executed an additional on-chain query.',
    requiredProperties: ['queryType'],
    activeForMau: true,
  },
}

export interface AnalyticsStore {
  taxonomyVersion: string
  events: AnalyticsEvent[]
}

export interface TrackAnalyticsEventInput {
  eventName: AnalyticsEventName
  userId: string
  occurredAt?: string
  source?: AnalyticsEventSource
  properties?: Record<string, AnalyticsPropertyValue>
}

export interface GrowthDashboardOptions {
  weeks?: number
  referenceDate?: Date
  activationWindowDays?: number
  retentionStartDays?: number
  retentionWindowDays?: number
  improvements?: ActivationImprovementMetric[]
}

interface NormalizedEvent extends AnalyticsEvent {
  timestamp: number
}

export function loadAnalyticsStore(filePath = ANALYTICS_DATA_PATH): AnalyticsStore {
  if (!fs.existsSync(filePath)) {
    return { taxonomyVersion: TAXONOMY_VERSION, events: [] }
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw) as Partial<AnalyticsStore>
  const events = Array.isArray(parsed.events) ? parsed.events : []

  return {
    taxonomyVersion: parsed.taxonomyVersion || TAXONOMY_VERSION,
    events,
  }
}

export function loadActivationImprovements(
  filePath = ACTIVATION_IMPROVEMENTS_DATA_PATH
): ActivationImprovementMetric[] {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed as ActivationImprovementMetric[] : []
}

export function saveAnalyticsStore(
  store: AnalyticsStore,
  filePath = ANALYTICS_DATA_PATH
): void {
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8')
}

export function validateEventAgainstTaxonomy(
  event: Pick<AnalyticsEvent, 'eventName' | 'properties'>
): string[] {
  const definition = EVENT_TAXONOMY[event.eventName]
  if (!definition) {
    return ['Unknown eventName']
  }

  const missing = definition.requiredProperties.filter((property) => {
    const value = event.properties[property]
    if (value === undefined || value === null) {
      return true
    }
    if (typeof value === 'string') {
      return value.trim().length === 0
    }
    return false
  })

  return missing.map((property) => `properties.${property} is required`)
}

export function trackAnalyticsEvent(
  input: TrackAnalyticsEventInput,
  filePath = ANALYTICS_DATA_PATH
): AnalyticsEvent {
  const store = loadAnalyticsStore(filePath)

  const event: AnalyticsEvent = {
    id: createEventId(),
    eventName: input.eventName,
    userId: input.userId,
    occurredAt: input.occurredAt || new Date().toISOString(),
    source: input.source || 'web',
    properties: input.properties || {},
  }

  const validationErrors = validateEventAgainstTaxonomy(event)
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '))
  }

  store.events.push(event)
  store.taxonomyVersion = TAXONOMY_VERSION
  saveAnalyticsStore(store, filePath)

  return event
}

export function buildGrowthDashboard(
  events: AnalyticsEvent[],
  options: GrowthDashboardOptions = {}
): GrowthDashboardData {
  const weeks = options.weeks || DEFAULT_WEEKS
  const activationWindowDays =
    options.activationWindowDays || DEFAULT_ACTIVATION_WINDOW_DAYS
  const retentionStartDays = options.retentionStartDays || DEFAULT_RETENTION_START_DAYS
  const retentionWindowDays = options.retentionWindowDays || DEFAULT_RETENTION_WINDOW_DAYS

  const normalizedEvents = normalizeEvents(events)
  const latestEventDate = normalizedEvents.length
    ? new Date(normalizedEvents[normalizedEvents.length - 1].timestamp)
    : new Date()
  const referenceDate = options.referenceDate || latestEventDate

  const weeklyMauTrend = calculateWeeklyMauTrend(normalizedEvents, referenceDate, weeks)
  const activation = calculateActivationMetrics(
    normalizedEvents,
    referenceDate,
    activationWindowDays
  )
  const retention = calculateRetentionMetrics(
    normalizedEvents,
    referenceDate,
    retentionStartDays,
    retentionWindowDays
  )
  const onboarding = calculateOnboardingInsights(
    normalizedEvents,
    options.improvements || []
  )

  return {
    generatedAt: new Date().toISOString(),
    taxonomyVersion: TAXONOMY_VERSION,
    taxonomy: getTaxonomyDefinitions(),
    weeklyMauTrend,
    activation,
    retention,
    onboarding,
  }
}

export function getGrowthDashboardData(
  filePath = ANALYTICS_DATA_PATH,
  options: GrowthDashboardOptions = {}
): GrowthDashboardData {
  const store = loadAnalyticsStore(filePath)
  const improvements = options.improvements || loadActivationImprovements()
  return buildGrowthDashboard(store.events, {
    ...options,
    improvements,
  })
}

function createEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeEvents(events: AnalyticsEvent[]): NormalizedEvent[] {
  return events
    .map((event) => {
      const parsed = Date.parse(event.occurredAt)
      return Number.isNaN(parsed) ? null : { ...event, timestamp: parsed }
    })
    .filter((event): event is NormalizedEvent => event !== null)
    .sort((a, b) => a.timestamp - b.timestamp)
}

function getTaxonomyDefinitions(): AnalyticsEventDefinition[] {
  const eventNames = Object.keys(EVENT_TAXONOMY) as AnalyticsEventName[]
  return eventNames.map((name) => ({
    name,
    ...EVENT_TAXONOMY[name],
    requiredProperties: [...EVENT_TAXONOMY[name].requiredProperties],
  }))
}

function calculateWeeklyMauTrend(
  events: NormalizedEvent[],
  referenceDate: Date,
  weeks: number
) {
  const activeEventNames = new Set(
    (Object.keys(EVENT_TAXONOMY) as AnalyticsEventName[]).filter(
      (name) => EVENT_TAXONOMY[name].activeForMau
    )
  )

  const endWeekStart = startOfUtcWeek(referenceDate)
  const trend = []

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const weekStart = addUtcDays(endWeekStart, -index * 7)
    const weekEnd = addUtcDays(weekStart, 7)
    const userIds = new Set<string>()

    for (const event of events) {
      if (!activeEventNames.has(event.eventName)) continue
      if (event.timestamp < weekStart.getTime()) continue
      if (event.timestamp >= weekEnd.getTime()) continue
      userIds.add(event.userId)
    }

    trend.push({
      weekStart: weekStart.toISOString(),
      weekLabel: formatWeekRangeLabel(weekStart),
      mau: userIds.size,
    })
  }

  return trend
}

function calculateActivationMetrics(
  events: NormalizedEvent[],
  referenceDate: Date,
  activationWindowDays: number
) {
  const signups = firstEventByUser(events, 'signup_completed')
  const activations = firstEventByUser(events, 'first_query_completed')

  let activatedUsers = 0
  let signupUsers = 0

  for (const [userId, signupDate] of signups.entries()) {
    if (signupDate.getTime() > referenceDate.getTime()) continue
    signupUsers += 1

    const activationDate = activations.get(userId)
    if (!activationDate) continue

    const diffDays = (activationDate.getTime() - signupDate.getTime()) / DAY_MS
    if (diffDays >= 0 && diffDays <= activationWindowDays) {
      activatedUsers += 1
    }
  }

  return {
    activatedUsers,
    signupUsers,
    rate: toPercent(activatedUsers, signupUsers),
    windowDays: activationWindowDays,
  }
}

function calculateRetentionMetrics(
  events: NormalizedEvent[],
  referenceDate: Date,
  retentionStartDays: number,
  retentionWindowDays: number
) {
  const signups = firstEventByUser(events, 'signup_completed')
  const activeEventNames = new Set(
    (Object.keys(EVENT_TAXONOMY) as AnalyticsEventName[]).filter(
      (name) => EVENT_TAXONOMY[name].activeForMau
    )
  )

  const cutoffDate = addUtcDays(referenceDate, -retentionStartDays)
  let eligibleUsers = 0
  let retainedUsers = 0

  for (const [userId, signupDate] of signups.entries()) {
    if (signupDate.getTime() > cutoffDate.getTime()) continue
    eligibleUsers += 1

    const retentionStart = addUtcDays(signupDate, retentionStartDays).getTime()
    const retentionEnd = addUtcDays(signupDate, retentionStartDays + retentionWindowDays).getTime()
    const retained = events.some((event) => {
      if (event.userId !== userId) return false
      if (!activeEventNames.has(event.eventName)) return false
      return event.timestamp >= retentionStart && event.timestamp < retentionEnd
    })

    if (retained) {
      retainedUsers += 1
    }
  }

  return {
    retainedUsers,
    eligibleUsers,
    d30Rate: toPercent(retainedUsers, eligibleUsers),
    startAfterSignupDays: retentionStartDays,
    windowDays: retentionWindowDays,
  }
}

function calculateOnboardingInsights(
  events: NormalizedEvent[],
  improvements: ActivationImprovementMetric[]
) {
  const landingUsers = firstEventByUser(events, 'landing_viewed').size
  const signupUsers = firstEventByUser(events, 'signup_completed').size
  const firstQueryUsers = firstEventByUser(events, 'first_query_completed').size
  const sevenDayReturnUsers = calculateSevenDayReturnUsers(events)

  const rawSteps: Array<Pick<FunnelStepMetrics, 'id' | 'label' | 'users'>> = [
    { id: 'landing_viewed', label: 'Landing Viewed', users: landingUsers },
    { id: 'signup_completed', label: 'Signup Completed', users: signupUsers },
    { id: 'first_query_completed', label: 'First Query Completed', users: firstQueryUsers },
    { id: 'seven_day_return', label: '7-Day Return', users: sevenDayReturnUsers },
  ]

  const steps: FunnelStepMetrics[] = rawSteps.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        conversionFromPrevious: 100,
        dropOffFromPrevious: 0,
      }
    }

    const previousUsers = rawSteps[index - 1].users
    const convertedUsers = Math.min(step.users, previousUsers)

    return {
      ...step,
      conversionFromPrevious: toPercent(convertedUsers, previousUsers),
      dropOffFromPrevious: toPercent(previousUsers - convertedUsers, previousUsers),
    }
  })

  const topDropOffStep = steps
    .slice(1)
    .reduce<FunnelStepMetrics | null>((worstStep, currentStep) => {
      if (!worstStep) return currentStep
      return currentStep.dropOffFromPrevious > worstStep.dropOffFromPrevious
        ? currentStep
        : worstStep
    }, null)

  return {
    funnel: {
      steps,
      topDropOffStep,
    },
    improvements: improvements
      .slice()
      .sort((left, right) => (right.after - right.before) - (left.after - left.before)),
  }
}

function calculateSevenDayReturnUsers(events: NormalizedEvent[]): number {
  const firstQueries = firstEventByUser(events, 'first_query_completed')
  const returningEventNames = new Set<AnalyticsEventName>(['session_started', 'query_executed'])

  let returnedUsers = 0

  for (const [userId, firstQueryDate] of firstQueries.entries()) {
    const firstQueryTimestamp = firstQueryDate.getTime()
    const returnDeadline = firstQueryTimestamp + 7 * DAY_MS
    const hasReturned = events.some((event) => {
      if (event.userId !== userId) return false
      if (!returningEventNames.has(event.eventName)) return false
      return event.timestamp > firstQueryTimestamp && event.timestamp <= returnDeadline
    })

    if (hasReturned) {
      returnedUsers += 1
    }
  }

  return returnedUsers
}

function firstEventByUser(
  events: NormalizedEvent[],
  eventName: AnalyticsEventName
): Map<string, Date> {
  const map = new Map<string, Date>()

  for (const event of events) {
    if (event.eventName !== eventName) continue
    if (map.has(event.userId)) continue
    map.set(event.userId, new Date(event.timestamp))
  }

  return map
}

function startOfUtcWeek(date: Date): Date {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = utcDate.getUTCDay()
  const daysSinceMonday = (day + 6) % 7
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday)
  return utcDate
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addUtcDays(weekStart, 6)
  return `${weekStart.getUTCMonth() + 1}/${weekStart.getUTCDate()}-${weekEnd.getUTCMonth() + 1}/${weekEnd.getUTCDate()}`
}

function toPercent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
}
