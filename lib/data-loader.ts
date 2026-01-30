import fs from 'fs'
import path from 'path'
import { DashboardData, Task } from './types'

export function loadDashboardData(): DashboardData {
  const filePath = path.join(process.cwd(), 'data', 'progress.json')
  const jsonData = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(jsonData) as DashboardData

  // 진행률 자동 계산
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
