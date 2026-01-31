/**
 * TDD Tests for Data Service
 */

import {
  updateTaskStatus,
  addTask,
  addBlocker,
  resolveBlocker,
  updateMetrics,
  updateMilestoneStatus,
  generateTaskId,
} from '../data-service'
import { DashboardData, Task } from '../types'

// Test data factory
function createTestData(): DashboardData {
  return {
    metadata: {
      projectName: 'Test Project',
      startDate: '2025-01-01',
      lastUpdated: '2025-01-01T00:00:00Z',
    },
    tracks: {
      preparation: {
        name: '사업 준비',
        progress: 0,
        tasks: [
          { id: 'prep-1', title: 'Task 1', status: 'pending', category: 'legal' },
          { id: 'prep-2', title: 'Task 2', status: 'in_progress', category: 'legal' },
        ],
      },
      development: {
        name: '개발',
        progress: 0,
        tasks: [
          { id: 'dev-1', title: 'Dev Task 1', status: 'pending', category: 'core' },
        ],
      },
    },
    phases: [
      {
        id: 'phase-1',
        name: 'MVP',
        duration: 'Month 1-2',
        progress: 0,
        milestones: [
          { id: 'm1', title: 'Beta Launch', status: 'pending' },
          { id: 'm2', title: 'Release', status: 'pending' },
        ],
      },
    ],
    metrics: {
      costs: { invested: 100000, revenue: 0, balance: 100000 },
      users: { signups: 0, paid: 0, churned: 0 },
    },
    blockers: [],
  }
}

describe('generateTaskId', () => {
  it('should generate unique id for preparation track', () => {
    const data = createTestData()
    const id = generateTaskId(data, 'preparation')
    expect(id).toBe('prep-3')
  })

  it('should generate unique id for development track', () => {
    const data = createTestData()
    const id = generateTaskId(data, 'development')
    expect(id).toBe('dev-2')
  })
})

describe('updateTaskStatus', () => {
  it('should update task status in preparation track', () => {
    const data = createTestData()
    const result = updateTaskStatus(data, 'prep-1', 'completed')

    expect(result.tracks.preparation.tasks[0].status).toBe('completed')
    expect(result.tracks.preparation.tasks[0].completedAt).toBeDefined()
  })

  it('should update task status in development track', () => {
    const data = createTestData()
    const result = updateTaskStatus(data, 'dev-1', 'in_progress')

    expect(result.tracks.development.tasks[0].status).toBe('in_progress')
  })

  it('should not mutate original data', () => {
    const data = createTestData()
    const originalStatus = data.tracks.preparation.tasks[0].status

    updateTaskStatus(data, 'prep-1', 'completed')

    expect(data.tracks.preparation.tasks[0].status).toBe(originalStatus)
  })

  it('should throw error for non-existent task', () => {
    const data = createTestData()

    expect(() => updateTaskStatus(data, 'non-existent', 'completed'))
      .toThrow('Task not found')
  })

  it('should remove completedAt when changing from completed to other status', () => {
    const data = createTestData()
    const completed = updateTaskStatus(data, 'prep-1', 'completed')
    const pending = updateTaskStatus(completed, 'prep-1', 'pending')

    expect(pending.tracks.preparation.tasks[0].completedAt).toBeUndefined()
  })

  it('should update lastUpdated timestamp', () => {
    const data = createTestData()
    const result = updateTaskStatus(data, 'prep-1', 'completed')

    expect(result.metadata.lastUpdated).not.toBe(data.metadata.lastUpdated)
  })
})

describe('addTask', () => {
  it('should add task to preparation track', () => {
    const data = createTestData()
    const result = addTask(data, {
      title: 'New Task',
      category: 'legal',
      track: 'preparation',
    })

    expect(result.tracks.preparation.tasks).toHaveLength(3)
    expect(result.tracks.preparation.tasks[2].title).toBe('New Task')
    expect(result.tracks.preparation.tasks[2].status).toBe('pending')
    expect(result.tracks.preparation.tasks[2].id).toBe('prep-3')
  })

  it('should add task to development track', () => {
    const data = createTestData()
    const result = addTask(data, {
      title: 'New Dev Task',
      category: 'core',
      track: 'development',
    })

    expect(result.tracks.development.tasks).toHaveLength(2)
    expect(result.tracks.development.tasks[1].id).toBe('dev-2')
  })

  it('should add task with blockedBy', () => {
    const data = createTestData()
    const result = addTask(data, {
      title: 'Blocked Task',
      category: 'legal',
      track: 'preparation',
      blockedBy: 'prep-1',
    })

    expect(result.tracks.preparation.tasks[2].blockedBy).toBe('prep-1')
    expect(result.tracks.preparation.tasks[2].status).toBe('blocked')
  })

  it('should not mutate original data', () => {
    const data = createTestData()
    const originalLength = data.tracks.preparation.tasks.length

    addTask(data, { title: 'New', category: 'test', track: 'preparation' })

    expect(data.tracks.preparation.tasks.length).toBe(originalLength)
  })
})

describe('addBlocker', () => {
  it('should add new blocker', () => {
    const data = createTestData()
    const result = addBlocker(data, {
      title: 'New Blocker',
      description: 'Description',
      affectedTasks: ['prep-1'],
    })

    expect(result.blockers).toHaveLength(1)
    expect(result.blockers[0].title).toBe('New Blocker')
    expect(result.blockers[0].resolved).toBe(false)
    expect(result.blockers[0].date).toBeDefined()
  })

  it('should update affected tasks to blocked status', () => {
    const data = createTestData()
    const result = addBlocker(data, {
      title: 'New Blocker',
      description: 'Description',
      affectedTasks: ['prep-1'],
    })

    expect(result.tracks.preparation.tasks[0].status).toBe('blocked')
  })

  it('should not mutate original data', () => {
    const data = createTestData()
    const originalLength = data.blockers.length

    addBlocker(data, { title: 'New', description: 'Desc', affectedTasks: [] })

    expect(data.blockers.length).toBe(originalLength)
  })
})

describe('resolveBlocker', () => {
  it('should mark blocker as resolved', () => {
    let data = createTestData()
    data = addBlocker(data, {
      title: 'Blocker',
      description: 'Desc',
      affectedTasks: ['prep-1'],
    })

    const result = resolveBlocker(data, 0)

    expect(result.blockers[0].resolved).toBe(true)
    expect(result.blockers[0].resolvedAt).toBeDefined()
  })

  it('should throw error for invalid index', () => {
    const data = createTestData()

    expect(() => resolveBlocker(data, 0)).toThrow('Blocker not found')
  })

  it('should not mutate original data', () => {
    let data = createTestData()
    data = addBlocker(data, {
      title: 'Blocker',
      description: 'Desc',
      affectedTasks: [],
    })
    const originalResolved = data.blockers[0].resolved

    resolveBlocker(data, 0)

    expect(data.blockers[0].resolved).toBe(originalResolved)
  })
})

describe('updateMetrics', () => {
  it('should update costs', () => {
    const data = createTestData()
    const result = updateMetrics(data, {
      costs: { invested: 200000 },
    })

    expect(result.metrics.costs.invested).toBe(200000)
    expect(result.metrics.costs.revenue).toBe(0) // Unchanged
  })

  it('should update users', () => {
    const data = createTestData()
    const result = updateMetrics(data, {
      users: { paid: 10, signups: 50 },
    })

    expect(result.metrics.users.paid).toBe(10)
    expect(result.metrics.users.signups).toBe(50)
    expect(result.metrics.users.churned).toBe(0) // Unchanged
  })

  it('should update both costs and users', () => {
    const data = createTestData()
    const result = updateMetrics(data, {
      costs: { revenue: 50000 },
      users: { paid: 25 },
    })

    expect(result.metrics.costs.revenue).toBe(50000)
    expect(result.metrics.users.paid).toBe(25)
  })

  it('should not mutate original data', () => {
    const data = createTestData()
    const originalPaid = data.metrics.users.paid

    updateMetrics(data, { users: { paid: 100 } })

    expect(data.metrics.users.paid).toBe(originalPaid)
  })
})

describe('updateMilestoneStatus', () => {
  it('should update milestone to completed', () => {
    const data = createTestData()
    const result = updateMilestoneStatus(data, 'phase-1', 'm1', 'completed')

    expect(result.phases[0].milestones[0].status).toBe('completed')
    expect(result.phases[0].milestones[0].completedAt).toBeDefined()
  })

  it('should update milestone to pending', () => {
    const data = createTestData()
    let result = updateMilestoneStatus(data, 'phase-1', 'm1', 'completed')
    result = updateMilestoneStatus(result, 'phase-1', 'm1', 'pending')

    expect(result.phases[0].milestones[0].status).toBe('pending')
    expect(result.phases[0].milestones[0].completedAt).toBeUndefined()
  })

  it('should throw error for non-existent phase', () => {
    const data = createTestData()

    expect(() => updateMilestoneStatus(data, 'non-existent', 'm1', 'completed'))
      .toThrow('Phase not found')
  })

  it('should throw error for non-existent milestone', () => {
    const data = createTestData()

    expect(() => updateMilestoneStatus(data, 'phase-1', 'non-existent', 'completed'))
      .toThrow('Milestone not found')
  })

  it('should not mutate original data', () => {
    const data = createTestData()
    const originalStatus = data.phases[0].milestones[0].status

    updateMilestoneStatus(data, 'phase-1', 'm1', 'completed')

    expect(data.phases[0].milestones[0].status).toBe(originalStatus)
  })
})
