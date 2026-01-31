import { DashboardData, Task } from './types'
import { AddTask, AddBlocker, UpdateMetrics, MilestoneStatus, TaskStatus, Track } from './validation'

/**
 * Generate a unique task ID for a given track
 */
export function generateTaskId(data: DashboardData, track: Track): string {
  const prefix = track === 'preparation' ? 'prep' : 'dev'
  const tasks = data.tracks[track].tasks
  const maxNum = tasks.reduce((max, task) => {
    const match = task.id.match(new RegExp(`^${prefix}-(\\d+)$`))
    if (match) {
      return Math.max(max, parseInt(match[1], 10))
    }
    return max
  }, 0)
  return `${prefix}-${maxNum + 1}`
}

/**
 * Get current ISO timestamp
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Find task by ID across all tracks
 */
function findTaskInfo(
  data: DashboardData,
  taskId: string
): { track: Track; index: number } | null {
  for (const track of ['preparation', 'development'] as Track[]) {
    const index = data.tracks[track].tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      return { track, index }
    }
  }
  return null
}

/**
 * Update task status (immutable)
 */
export function updateTaskStatus(
  data: DashboardData,
  taskId: string,
  status: TaskStatus
): DashboardData {
  const taskInfo = findTaskInfo(data, taskId)
  if (!taskInfo) {
    throw new Error('Task not found')
  }

  const { track, index } = taskInfo
  const task = data.tracks[track].tasks[index]

  const updatedTask: Task = {
    ...task,
    status,
    completedAt: status === 'completed' ? getCurrentTimestamp() : undefined,
  }

  const updatedTasks = [
    ...data.tracks[track].tasks.slice(0, index),
    updatedTask,
    ...data.tracks[track].tasks.slice(index + 1),
  ]

  return {
    ...data,
    metadata: {
      ...data.metadata,
      lastUpdated: getCurrentTimestamp(),
    },
    tracks: {
      ...data.tracks,
      [track]: {
        ...data.tracks[track],
        tasks: updatedTasks,
      },
    },
  }
}

/**
 * Add a new task (immutable)
 */
export function addTask(
  data: DashboardData,
  input: AddTask
): DashboardData {
  const { title, category, track, blockedBy } = input
  const id = generateTaskId(data, track)

  const newTask: Task = {
    id,
    title,
    category,
    status: blockedBy ? 'blocked' : 'pending',
    blockedBy,
  }

  return {
    ...data,
    metadata: {
      ...data.metadata,
      lastUpdated: getCurrentTimestamp(),
    },
    tracks: {
      ...data.tracks,
      [track]: {
        ...data.tracks[track],
        tasks: [...data.tracks[track].tasks, newTask],
      },
    },
  }
}

/**
 * Add a new blocker (immutable)
 */
export function addBlocker(
  data: DashboardData,
  input: AddBlocker
): DashboardData {
  const { title, description, affectedTasks } = input

  const newBlocker = {
    date: getCurrentTimestamp().split('T')[0],
    title,
    description,
    affectedTasks,
    resolved: false,
  }

  // Update affected tasks to blocked status
  let updatedData = {
    ...data,
    blockers: [...data.blockers, newBlocker],
    metadata: {
      ...data.metadata,
      lastUpdated: getCurrentTimestamp(),
    },
  }

  for (const taskId of affectedTasks) {
    try {
      updatedData = updateTaskStatus(updatedData, taskId, 'blocked')
    } catch {
      // Task not found, skip
    }
  }

  return updatedData
}

/**
 * Resolve a blocker by index (immutable)
 */
export function resolveBlocker(
  data: DashboardData,
  index: number
): DashboardData {
  if (index < 0 || index >= data.blockers.length) {
    throw new Error('Blocker not found')
  }

  const blocker = data.blockers[index]
  const updatedBlocker = {
    ...blocker,
    resolved: true,
    resolvedAt: getCurrentTimestamp(),
  }

  const updatedBlockers = [
    ...data.blockers.slice(0, index),
    updatedBlocker,
    ...data.blockers.slice(index + 1),
  ]

  return {
    ...data,
    blockers: updatedBlockers,
    metadata: {
      ...data.metadata,
      lastUpdated: getCurrentTimestamp(),
    },
  }
}

/**
 * Update metrics (immutable, partial update)
 */
export function updateMetrics(
  data: DashboardData,
  input: UpdateMetrics
): DashboardData {
  const { costs, users } = input

  return {
    ...data,
    metadata: {
      ...data.metadata,
      lastUpdated: getCurrentTimestamp(),
    },
    metrics: {
      costs: {
        ...data.metrics.costs,
        ...(costs || {}),
      },
      users: {
        ...data.metrics.users,
        ...(users || {}),
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
    throw new Error('Phase not found')
  }

  const phase = data.phases[phaseIndex]
  const milestoneIndex = phase.milestones.findIndex(m => m.id === milestoneId)
  if (milestoneIndex === -1) {
    throw new Error('Milestone not found')
  }

  const milestone = phase.milestones[milestoneIndex]
  const updatedMilestone = {
    ...milestone,
    status,
    completedAt: status === 'completed' ? getCurrentTimestamp() : undefined,
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
    metadata: {
      ...data.metadata,
      lastUpdated: getCurrentTimestamp(),
    },
  }
}
