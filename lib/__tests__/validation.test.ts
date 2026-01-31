/**
 * TDD Tests for Validation Schemas
 */

import { z } from 'zod'
import {
  TaskSchema,
  BlockerSchema,
  MetricsSchema,
  MilestoneSchema,
  UpdateTaskStatusSchema,
  AddTaskSchema,
  AddBlockerSchema,
  UpdateMetricsSchema,
} from '../validation'

describe('TaskSchema', () => {
  it('should validate a valid task', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      status: 'pending',
      category: 'legal',
    }
    const result = TaskSchema.safeParse(task)
    expect(result.success).toBe(true)
  })

  it('should validate task with optional fields', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      status: 'blocked',
      category: 'legal',
      blockedBy: 'task-0',
      completedAt: '2025-01-31',
      notes: 'Some notes',
    }
    const result = TaskSchema.safeParse(task)
    expect(result.success).toBe(true)
  })

  it('should reject invalid status', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      status: 'invalid',
      category: 'legal',
    }
    const result = TaskSchema.safeParse(task)
    expect(result.success).toBe(false)
  })

  it('should reject empty id', () => {
    const task = {
      id: '',
      title: 'Test Task',
      status: 'pending',
      category: 'legal',
    }
    const result = TaskSchema.safeParse(task)
    expect(result.success).toBe(false)
  })

  it('should reject empty title', () => {
    const task = {
      id: 'task-1',
      title: '',
      status: 'pending',
      category: 'legal',
    }
    const result = TaskSchema.safeParse(task)
    expect(result.success).toBe(false)
  })
})

describe('UpdateTaskStatusSchema', () => {
  it('should validate valid status update', () => {
    const update = {
      taskId: 'task-1',
      status: 'completed',
    }
    const result = UpdateTaskStatusSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should reject invalid status', () => {
    const update = {
      taskId: 'task-1',
      status: 'done',
    }
    const result = UpdateTaskStatusSchema.safeParse(update)
    expect(result.success).toBe(false)
  })
})

describe('AddTaskSchema', () => {
  it('should validate new task', () => {
    const task = {
      title: 'New Task',
      category: 'development',
      track: 'preparation',
    }
    const result = AddTaskSchema.safeParse(task)
    expect(result.success).toBe(true)
  })

  it('should validate task with blockedBy', () => {
    const task = {
      title: 'New Task',
      category: 'development',
      track: 'development',
      blockedBy: 'task-1',
    }
    const result = AddTaskSchema.safeParse(task)
    expect(result.success).toBe(true)
  })

  it('should reject invalid track', () => {
    const task = {
      title: 'New Task',
      category: 'development',
      track: 'invalid',
    }
    const result = AddTaskSchema.safeParse(task)
    expect(result.success).toBe(false)
  })

  it('should reject empty title', () => {
    const task = {
      title: '',
      category: 'development',
      track: 'preparation',
    }
    const result = AddTaskSchema.safeParse(task)
    expect(result.success).toBe(false)
  })
})

describe('BlockerSchema', () => {
  it('should validate a valid blocker', () => {
    const blocker = {
      date: '2025-01-31',
      title: 'Blocker Title',
      description: 'Blocker description',
      affectedTasks: ['task-1', 'task-2'],
      resolved: false,
    }
    const result = BlockerSchema.safeParse(blocker)
    expect(result.success).toBe(true)
  })

  it('should validate resolved blocker', () => {
    const blocker = {
      date: '2025-01-31',
      title: 'Blocker Title',
      description: 'Blocker description',
      affectedTasks: ['task-1'],
      resolved: true,
      resolvedAt: '2025-02-01',
    }
    const result = BlockerSchema.safeParse(blocker)
    expect(result.success).toBe(true)
  })
})

describe('AddBlockerSchema', () => {
  it('should validate new blocker', () => {
    const blocker = {
      title: 'New Blocker',
      description: 'Description',
      affectedTasks: ['task-1'],
    }
    const result = AddBlockerSchema.safeParse(blocker)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const blocker = {
      title: '',
      description: 'Description',
      affectedTasks: ['task-1'],
    }
    const result = AddBlockerSchema.safeParse(blocker)
    expect(result.success).toBe(false)
  })
})

describe('MetricsSchema', () => {
  it('should validate valid metrics', () => {
    const metrics = {
      costs: {
        invested: 100000,
        revenue: 50000,
        balance: 50000,
      },
      users: {
        signups: 100,
        paid: 10,
        churned: 2,
      },
    }
    const result = MetricsSchema.safeParse(metrics)
    expect(result.success).toBe(true)
  })

  it('should reject negative values', () => {
    const metrics = {
      costs: {
        invested: -100,
        revenue: 50000,
        balance: 50000,
      },
      users: {
        signups: 100,
        paid: 10,
        churned: 2,
      },
    }
    const result = MetricsSchema.safeParse(metrics)
    expect(result.success).toBe(false)
  })
})

describe('UpdateMetricsSchema', () => {
  it('should validate partial costs update', () => {
    const update = {
      costs: {
        invested: 200000,
      },
    }
    const result = UpdateMetricsSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should validate partial users update', () => {
    const update = {
      users: {
        paid: 25,
      },
    }
    const result = UpdateMetricsSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should validate full update', () => {
    const update = {
      costs: {
        invested: 200000,
        revenue: 100000,
        balance: 100000,
      },
      users: {
        signups: 200,
        paid: 50,
        churned: 5,
      },
    }
    const result = UpdateMetricsSchema.safeParse(update)
    expect(result.success).toBe(true)
  })
})

describe('MilestoneSchema', () => {
  it('should validate a valid milestone', () => {
    const milestone = {
      id: 'm1',
      title: 'Beta Launch',
      status: 'pending',
    }
    const result = MilestoneSchema.safeParse(milestone)
    expect(result.success).toBe(true)
  })

  it('should validate completed milestone', () => {
    const milestone = {
      id: 'm1',
      title: 'Beta Launch',
      status: 'completed',
      completedAt: '2025-01-31',
      metric: '100 users',
    }
    const result = MilestoneSchema.safeParse(milestone)
    expect(result.success).toBe(true)
  })
})
