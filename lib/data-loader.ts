import fs from 'fs'
import path from 'path'
import { DashboardData, Task, Phase } from './types'

const VALID_STATUSES = ['completed', 'in_progress', 'blocked', 'pending'] as const

export function loadDashboardData(): DashboardData {
  const filePath = path.join(process.cwd(), 'data', 'progress.json')
  const jsonData = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(jsonData) as DashboardData

  // 진행률 자동 계산
  data.tracks.initialSetup.progress = calculateProgress(data.tracks.initialSetup.tasks)
  data.tracks.preparation.progress = calculateProgress(data.tracks.preparation.tasks)
  data.tracks.development.progress = calculateProgress(data.tracks.development.tasks)

  return data
}

export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'completed').length
  return Math.round((completed / tasks.length) * 100)
}

export function getStatusIcon(status: Task['status']): string {
  switch (status) {
    case 'completed':
      return '✅'
    case 'in_progress':
      return '🔄'
    case 'blocked':
      return '🚫'
    case 'pending':
    default:
      return '⬜'
  }
}

export function getStatusColor(status: Task['status']): string {
  switch (status) {
    case 'completed':
      return 'text-emerald-600'
    case 'in_progress':
      return 'text-amber-600'
    case 'blocked':
      return 'text-red-600'
    case 'pending':
    default:
      return 'text-slate-400'
  }
}

/**
 * Validates a Task object has required fields and valid status
 */
export function validateTask(task: Task): boolean {
  if (!task.id || typeof task.id !== 'string') return false
  if (!task.title || typeof task.title !== 'string') return false
  if (!task.category || typeof task.category !== 'string') return false
  if (!VALID_STATUSES.includes(task.status as typeof VALID_STATUSES[number])) return false
  return true
}

/**
 * Validates a Phase object has required fields and at least one milestone
 */
export function validatePhase(phase: Phase): boolean {
  if (!phase.id || typeof phase.id !== 'string') return false
  if (!phase.name || typeof phase.name !== 'string') return false
  if (!phase.milestones || !Array.isArray(phase.milestones)) return false
  if (phase.milestones.length === 0) return false
  return true
}

/**
 * Filters tasks by status
 */
export function getTasksByStatus(tasks: Task[], status: Task['status']): Task[] {
  return tasks.filter(task => task.status === status)
}
