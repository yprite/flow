export interface DashboardData {
  metadata: {
    projectName: string
    startDate: string
    lastUpdated: string
  }

  tracks: {
    preparation: Track
    development: Track
  }

  phases: Phase[]

  metrics: {
    costs: { invested: number; revenue: number; balance: number }
    users: { signups: number; paid: number; churned: number }
  }

  blockers: Blocker[]
}

export interface Track {
  name: string
  progress: number // 0-100 (자동 계산)
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  status: 'completed' | 'in_progress' | 'blocked' | 'pending'
  blockedBy?: string // 다른 task id
  category?: string
  completedAt?: string
  notes?: string
}

export interface Phase {
  id: string
  name: string
  duration: string
  progress: number
  unlockCondition?: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  status: 'completed' | 'pending'
  completedAt?: string
  metric?: string
}

export interface Blocker {
  date: string
  title: string
  description: string
  affectedTasks: string[]
  resolved: boolean
  resolvedAt?: string
}
