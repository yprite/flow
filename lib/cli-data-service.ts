import fs from 'fs'
import path from 'path'
import { DashboardData, Task } from './types'
import { TaskStatus, MilestoneStatus } from './validation'

const DATA_FILE = 'data/progress.json'

/**
 * Get the absolute path to progress.json
 */
function getDataPath(basePath?: string): string {
  const base = basePath || path.resolve(__dirname, '..')
  return path.join(base, DATA_FILE)
}

/**
 * Load dashboard data from JSON file
 */
export function loadData(basePath?: string): DashboardData {
  const filePath = getDataPath(basePath)
  const jsonData = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(jsonData) as DashboardData

  // Auto-calculate progress
  data.tracks.preparation.progress = calculateProgress(data.tracks.preparation.tasks)
  data.tracks.development.progress = calculateProgress(data.tracks.development.tasks)

  return data
}

/**
 * Save dashboard data to JSON file
 */
export function saveData(data: DashboardData, basePath?: string): void {
  const filePath = getDataPath(basePath)

  // Recalculate progress before saving
  const updatedData = {
    ...data,
    tracks: {
      ...data.tracks,
      preparation: {
        ...data.tracks.preparation,
        progress: calculateProgress(data.tracks.preparation.tasks),
      },
      development: {
        ...data.tracks.development,
        progress: calculateProgress(data.tracks.development.tasks),
      },
    },
    metadata: {
      ...data.metadata,
      lastUpdated: new Date().toISOString(),
    },
  }

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8')
}

/**
 * Calculate progress percentage
 */
function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'completed').length
  return Math.round((completed / tasks.length) * 100)
}

/**
 * Assert that a task ID belongs to the development track
 */
function assertDevelopmentTask(taskId: string): void {
  if (!taskId.startsWith('dev-')) {
    throw new Error(
      `Access denied: Task "${taskId}" is not in development track. ` +
      `Only dev-* tasks can be modified by Claude.`
    )
  }
}

/**
 * Generate next task ID for development track
 */
export function generateDevTaskId(data: DashboardData): string {
  const tasks = data.tracks.development.tasks
  const maxNum = tasks.reduce((max, task) => {
    const match = task.id.match(/^dev-(\d+)$/)
    if (match) {
      return Math.max(max, parseInt(match[1], 10))
    }
    return max
  }, 0)
  return `dev-${maxNum + 1}`
}

/**
 * Update development task status (immutable)
 */
export function updateDevTaskStatus(
  data: DashboardData,
  taskId: string,
  status: TaskStatus
): DashboardData {
  assertDevelopmentTask(taskId)

  const tasks = data.tracks.development.tasks
  const index = tasks.findIndex(t => t.id === taskId)

  if (index === -1) {
    throw new Error(`Task not found: ${taskId}`)
  }

  const task = tasks[index]
  const updatedTask: Task = {
    ...task,
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
  }

  const updatedTasks = [
    ...tasks.slice(0, index),
    updatedTask,
    ...tasks.slice(index + 1),
  ]

  return {
    ...data,
    tracks: {
      ...data.tracks,
      development: {
        ...data.tracks.development,
        tasks: updatedTasks,
      },
    },
  }
}

/**
 * Add new development task (immutable)
 */
export function addDevTask(
  data: DashboardData,
  input: { title: string; category: string; blockedBy?: string; notes?: string }
): DashboardData {
  const id = generateDevTaskId(data)

  const newTask: Task = {
    id,
    title: input.title,
    category: input.category,
    status: input.blockedBy ? 'blocked' : 'pending',
    blockedBy: input.blockedBy,
    notes: input.notes,
  }

  return {
    ...data,
    tracks: {
      ...data.tracks,
      development: {
        ...data.tracks.development,
        tasks: [...data.tracks.development.tasks, newTask],
      },
    },
  }
}

/**
 * Update milestone status (immutable)
 */
export function updateMilestoneStatus(
  data: DashboardData,
  phaseId: string,
  milestoneId: string,
  status: MilestoneStatus
): DashboardData {
  const phaseIndex = data.phases.findIndex(p => p.id === phaseId)
  if (phaseIndex === -1) {
    throw new Error(`Phase not found: ${phaseId}`)
  }

  const phase = data.phases[phaseIndex]
  const milestoneIndex = phase.milestones.findIndex(m => m.id === milestoneId)
  if (milestoneIndex === -1) {
    throw new Error(`Milestone not found: ${milestoneId}`)
  }

  const milestone = phase.milestones[milestoneIndex]
  const updatedMilestone = {
    ...milestone,
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
  }

  const updatedMilestones = [
    ...phase.milestones.slice(0, milestoneIndex),
    updatedMilestone,
    ...phase.milestones.slice(milestoneIndex + 1),
  ]

  const updatedPhase = {
    ...phase,
    milestones: updatedMilestones,
  }

  const updatedPhases = [
    ...data.phases.slice(0, phaseIndex),
    updatedPhase,
    ...data.phases.slice(phaseIndex + 1),
  ]

  return {
    ...data,
    phases: updatedPhases,
  }
}

/**
 * Get development track summary
 */
export function getDevTrackSummary(data: DashboardData): {
  total: number
  completed: number
  inProgress: number
  blocked: number
  pending: number
  progress: number
} {
  const tasks = data.tracks.development.tasks
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    progress: data.tracks.development.progress,
  }
}
