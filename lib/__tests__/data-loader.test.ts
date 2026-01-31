/**
 * TDD Tests for Data Loader
 *
 * RED Phase: These tests should FAIL initially
 * GREEN Phase: Implement to make them pass
 * REFACTOR Phase: Clean up while keeping tests green
 */

import {
  calculateProgress,
  loadDashboardData,
  validateTask,
  validatePhase,
  getTasksByStatus
} from '../data-loader'
import { Task, Phase, DashboardData } from '../types'

describe('calculateProgress', () => {
  it('should return 0 for empty task array', () => {
    const tasks: Task[] = []
    expect(calculateProgress(tasks)).toBe(0)
  })

  it('should return 100 when all tasks are completed', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'completed', category: 'test' },
      { id: '2', title: 'Task 2', status: 'completed', category: 'test' },
    ]
    expect(calculateProgress(tasks)).toBe(100)
  })

  it('should return 0 when no tasks are completed', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'pending', category: 'test' },
      { id: '2', title: 'Task 2', status: 'pending', category: 'test' },
    ]
    expect(calculateProgress(tasks)).toBe(0)
  })

  it('should return correct percentage for mixed status', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'completed', category: 'test' },
      { id: '2', title: 'Task 2', status: 'pending', category: 'test' },
      { id: '3', title: 'Task 3', status: 'in_progress', category: 'test' },
      { id: '4', title: 'Task 4', status: 'completed', category: 'test' },
    ]
    expect(calculateProgress(tasks)).toBe(50) // 2 out of 4
  })

  it('should round to nearest integer', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'completed', category: 'test' },
      { id: '2', title: 'Task 2', status: 'pending', category: 'test' },
      { id: '3', title: 'Task 3', status: 'pending', category: 'test' },
    ]
    expect(calculateProgress(tasks)).toBe(33) // 1/3 = 33.33... -> 33
  })
})

describe('validateTask', () => {
  it('should return true for valid task', () => {
    const task: Task = {
      id: 'task-1',
      title: 'Valid Task',
      status: 'pending',
      category: 'legal'
    }
    expect(validateTask(task)).toBe(true)
  })

  it('should return false for task without id', () => {
    const task = {
      title: 'Invalid Task',
      status: 'pending',
      category: 'legal'
    } as Task
    expect(validateTask(task)).toBe(false)
  })

  it('should return false for task with invalid status', () => {
    const task = {
      id: 'task-1',
      title: 'Invalid Task',
      status: 'invalid_status',
      category: 'legal'
    } as unknown as Task
    expect(validateTask(task)).toBe(false)
  })

  it('should return true for task with optional blockedBy', () => {
    const task: Task = {
      id: 'task-1',
      title: 'Blocked Task',
      status: 'blocked',
      category: 'legal',
      blockedBy: 'task-0'
    }
    expect(validateTask(task)).toBe(true)
  })
})

describe('validatePhase', () => {
  it('should return true for valid phase', () => {
    const phase: Phase = {
      id: 'phase-1',
      name: 'MVP Launch',
      duration: 'Month 1-2',
      progress: 0,
      milestones: [
        { id: 'm1', title: 'Beta Test', status: 'pending' }
      ]
    }
    expect(validatePhase(phase)).toBe(true)
  })

  it('should return false for phase without milestones', () => {
    const phase = {
      id: 'phase-1',
      name: 'Invalid Phase',
      duration: 'Month 1',
      progress: 0,
      milestones: []
    } as Phase
    expect(validatePhase(phase)).toBe(false)
  })
})

describe('getTasksByStatus', () => {
  const tasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'completed', category: 'test' },
    { id: '2', title: 'Task 2', status: 'pending', category: 'test' },
    { id: '3', title: 'Task 3', status: 'in_progress', category: 'test' },
    { id: '4', title: 'Task 4', status: 'blocked', category: 'test' },
    { id: '5', title: 'Task 5', status: 'completed', category: 'test' },
  ]

  it('should return all completed tasks', () => {
    const result = getTasksByStatus(tasks, 'completed')
    expect(result).toHaveLength(2)
    expect(result.every(t => t.status === 'completed')).toBe(true)
  })

  it('should return all pending tasks', () => {
    const result = getTasksByStatus(tasks, 'pending')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('should return all blocked tasks', () => {
    const result = getTasksByStatus(tasks, 'blocked')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('4')
  })

  it('should return empty array for status with no tasks', () => {
    const allCompleted: Task[] = [
      { id: '1', title: 'Task 1', status: 'completed', category: 'test' },
    ]
    const result = getTasksByStatus(allCompleted, 'blocked')
    expect(result).toHaveLength(0)
  })
})

describe('loadDashboardData', () => {
  it('should load data from JSON file', () => {
    const data = loadDashboardData()
    expect(data).toBeDefined()
    expect(data.metadata).toBeDefined()
    expect(data.tracks).toBeDefined()
    expect(data.phases).toBeDefined()
  })

  it('should have correct structure for tracks', () => {
    const data = loadDashboardData()
    expect(data.tracks.preparation).toBeDefined()
    expect(data.tracks.development).toBeDefined()
    expect(Array.isArray(data.tracks.preparation.tasks)).toBe(true)
    expect(Array.isArray(data.tracks.development.tasks)).toBe(true)
  })

  it('should calculate progress automatically', () => {
    const data = loadDashboardData()
    expect(typeof data.tracks.preparation.progress).toBe('number')
    expect(data.tracks.preparation.progress).toBeGreaterThanOrEqual(0)
    expect(data.tracks.preparation.progress).toBeLessThanOrEqual(100)
  })
})
