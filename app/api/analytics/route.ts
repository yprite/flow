import { NextRequest, NextResponse } from 'next/server'
import {
  buildGrowthDashboard,
  EVENT_TAXONOMY,
  loadAnalyticsStore,
  trackAnalyticsEvent,
} from '@/lib/analytics-service'
import { TrackAnalyticsEventSchema } from '@/lib/validation'

export async function GET() {
  try {
    const store = loadAnalyticsStore()
    const dashboard = buildGrowthDashboard(store.events)
    const recentEvents = store.events
      .slice()
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
      .slice(0, 20)

    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        taxonomy: EVENT_TAXONOMY,
        totalEvents: store.events.length,
        recentEvents,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = TrackAnalyticsEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const event = trackAnalyticsEvent(parsed.data)
    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    )
  }
}
