export interface DashboardData {
  metadata: {
    projectName: string
    startDate: string
    lastUpdated: string
  }

  tracks: {
    initialSetup: Track
    preparation: Track
    development: Track
  }

  phases: Phase[]

  metrics: {
    costs: { invested: number; revenue: number; balance: number }
    users: { signups: number; paid: number; churned: number }
  }

  blockers: Blocker[]
  analytics?: GrowthDashboardData
}

export interface Track {
  name: string
  progress: number // 0-100 (자동 계산)
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  status: 'completed' | 'in_progress' | 'blocked' | 'pending'
  blockedBy?: string // 다른 task id
  category?: string
  completedAt?: string
  notes?: string
}

export interface Phase {
  id: string
  name: string
  duration: string
  progress: number
  unlockCondition?: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  status: 'completed' | 'pending'
  completedAt?: string
  metric?: string
}

export interface Blocker {
  date: string
  title: string
  description: string
  affectedTasks: string[]
  resolved: boolean
  resolvedAt?: string
}

export type AnalyticsEventName =
  | 'landing_viewed'
  | 'signup_completed'
  | 'first_query_completed'
  | 'session_started'
  | 'query_executed'

export type AnalyticsEventCategory =
  | 'acquisition'
  | 'activation'
  | 'engagement'
  | 'retention'

export type AnalyticsEventSource =
  | 'web'
  | 'api'
  | 'worker'
  | 'import'

export type AnalyticsPropertyValue = string | number | boolean | null

export interface AnalyticsEvent {
  id: string
  eventName: AnalyticsEventName
  userId: string
  occurredAt: string
  source: AnalyticsEventSource
  properties: Record<string, AnalyticsPropertyValue>
}

export interface AnalyticsEventDefinition {
  name: AnalyticsEventName
  category: AnalyticsEventCategory
  description: string
  requiredProperties: string[]
  activeForMau: boolean
}

export interface WeeklyMauPoint {
  weekStart: string
  weekLabel: string
  mau: number
}

export interface ActivationMetrics {
  activatedUsers: number
  signupUsers: number
  rate: number
  windowDays: number
}

export interface RetentionMetrics {
  retainedUsers: number
  eligibleUsers: number
  d30Rate: number
  startAfterSignupDays: number
  windowDays: number
}

export interface FunnelStepMetrics {
  id: 'landing_viewed' | 'signup_completed' | 'first_query_completed' | 'seven_day_return'
  label: string
  users: number
  conversionFromPrevious: number
  dropOffFromPrevious: number
}

export interface ActivationImprovementMetric {
  id: string
  title: string
  change: string
  metric: string
  before: number
  after: number
  sampleSize: number
  windowDays: number
}

export interface OnboardingInsights {
  funnel: {
    steps: FunnelStepMetrics[]
    topDropOffStep: FunnelStepMetrics | null
  }
  improvements: ActivationImprovementMetric[]
}

export interface GrowthDashboardData {
  generatedAt: string
  taxonomyVersion: string
  taxonomy: AnalyticsEventDefinition[]
  weeklyMauTrend: WeeklyMauPoint[]
  activation: ActivationMetrics
  retention: RetentionMetrics
  onboarding: OnboardingInsights
}
