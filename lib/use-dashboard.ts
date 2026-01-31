'use client'

import useSWR from 'swr'
import { DashboardData } from './types'
import { TaskStatus, MilestoneStatus, Track } from './validation'

interface ApiResponse {
  success: boolean
  data?: DashboardData
  error?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    '/api/progress',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  const dashboardData = data?.success ? data.data : undefined

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateTaskStatus',
          payload: { taskId, status },
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate(result, false)
      }
      return result
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  const addTask = async (task: {
    title: string
    category: string
    track: Track
    blockedBy?: string
  }) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTask',
          payload: task,
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate(result, false)
      }
      return result
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  const addBlocker = async (blocker: {
    title: string
    description: string
    affectedTasks: string[]
  }) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addBlocker',
          payload: blocker,
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate(result, false)
      }
      return result
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  const resolveBlocker = async (index: number) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolveBlocker',
          payload: { index },
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate(result, false)
      }
      return result
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  const updateMetrics = async (metrics: {
    costs?: { invested?: number; revenue?: number; balance?: number }
    users?: { signups?: number; paid?: number; churned?: number }
  }) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMetrics',
          payload: metrics,
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate(result, false)
      }
      return result
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  const updateMilestone = async (
    phaseId: string,
    milestoneId: string,
    status: MilestoneStatus
  ) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMilestone',
          payload: { phaseId, milestoneId, status },
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate(result, false)
      }
      return result
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    data: dashboardData,
    isLoading,
    error: error || (data && !data.success ? data.error : undefined),
    updateTaskStatus,
    addTask,
    addBlocker,
    resolveBlocker,
    updateMetrics,
    updateMilestone,
    refresh: () => mutate(),
  }
}
