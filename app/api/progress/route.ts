import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DashboardData } from '@/lib/types'
import {
  updateTaskStatus,
  addTask,
  addBlocker,
  resolveBlocker,
  updateMetrics,
  updateMilestoneStatus,
} from '@/lib/data-service'
import {
  UpdateTaskStatusSchema,
  AddTaskSchema,
  AddBlockerSchema,
  ResolveBlockerSchema,
  UpdateMetricsSchema,
  UpdateMilestoneSchema,
} from '@/lib/validation'
import { calculateProgress } from '@/lib/data-loader'

const DATA_PATH = path.join(process.cwd(), 'data', 'progress.json')

function loadData(): DashboardData {
  const jsonData = fs.readFileSync(DATA_PATH, 'utf-8')
  const data = JSON.parse(jsonData) as DashboardData
  data.tracks.preparation.progress = calculateProgress(data.tracks.preparation.tasks)
  data.tracks.development.progress = calculateProgress(data.tracks.development.tasks)
  return data
}

function saveData(data: DashboardData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const data = loadData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to load data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload } = body

    let data = loadData()
    let result: DashboardData

    switch (action) {
      case 'updateTaskStatus': {
        const parsed = UpdateTaskStatusSchema.safeParse(payload)
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid payload', details: parsed.error.issues },
            { status: 400 }
          )
        }
        result = updateTaskStatus(data, parsed.data.taskId, parsed.data.status)
        break
      }

      case 'addTask': {
        const parsed = AddTaskSchema.safeParse(payload)
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid payload', details: parsed.error.issues },
            { status: 400 }
          )
        }
        result = addTask(data, parsed.data)
        break
      }

      case 'addBlocker': {
        const parsed = AddBlockerSchema.safeParse(payload)
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid payload', details: parsed.error.issues },
            { status: 400 }
          )
        }
        result = addBlocker(data, parsed.data)
        break
      }

      case 'resolveBlocker': {
        const parsed = ResolveBlockerSchema.safeParse(payload)
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid payload', details: parsed.error.issues },
            { status: 400 }
          )
        }
        result = resolveBlocker(data, parsed.data.index)
        break
      }

      case 'updateMetrics': {
        const parsed = UpdateMetricsSchema.safeParse(payload)
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid payload', details: parsed.error.issues },
            { status: 400 }
          )
        }
        result = updateMetrics(data, parsed.data)
        break
      }

      case 'updateMilestone': {
        const parsed = UpdateMilestoneSchema.safeParse(payload)
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid payload', details: parsed.error.issues },
            { status: 400 }
          )
        }
        result = updateMilestoneStatus(
          data,
          parsed.data.phaseId,
          parsed.data.milestoneId,
          parsed.data.status
        )
        break
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }

    // Recalculate progress after update
    result.tracks.preparation.progress = calculateProgress(result.tracks.preparation.tasks)
    result.tracks.development.progress = calculateProgress(result.tracks.development.tasks)

    saveData(result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
