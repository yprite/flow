import { z } from 'zod'

// Task status enum
export const TaskStatusEnum = z.enum(['completed', 'in_progress', 'blocked', 'pending'])
export type TaskStatus = z.infer<typeof TaskStatusEnum>

// Track enum
export const TrackEnum = z.enum(['preparation', 'development'])
export type Track = z.infer<typeof TrackEnum>

// Milestone status enum
export const MilestoneStatusEnum = z.enum(['completed', 'pending'])
export type MilestoneStatus = z.infer<typeof MilestoneStatusEnum>

// Task schema
export const TaskSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  status: TaskStatusEnum,
  category: z.string().min(1, 'Category is required'),
  blockedBy: z.string().optional(),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
})
export type Task = z.infer<typeof TaskSchema>

// Milestone schema
export const MilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: MilestoneStatusEnum,
  completedAt: z.string().optional(),
  metric: z.string().optional(),
})
export type Milestone = z.infer<typeof MilestoneSchema>

// Blocker schema
export const BlockerSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  affectedTasks: z.array(z.string()),
  resolved: z.boolean(),
  resolvedAt: z.string().optional(),
})
export type Blocker = z.infer<typeof BlockerSchema>

// Metrics schema
export const CostsSchema = z.object({
  invested: z.number().min(0, 'Must be non-negative'),
  revenue: z.number().min(0, 'Must be non-negative'),
  balance: z.number(),
})

export const UsersSchema = z.object({
  signups: z.number().min(0).int(),
  paid: z.number().min(0).int(),
  churned: z.number().min(0).int(),
})

export const MetricsSchema = z.object({
  costs: CostsSchema,
  users: UsersSchema,
})
export type Metrics = z.infer<typeof MetricsSchema>

// Update schemas (for API requests)
export const UpdateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: TaskStatusEnum,
})
export type UpdateTaskStatus = z.infer<typeof UpdateTaskStatusSchema>

export const AddTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  track: TrackEnum,
  blockedBy: z.string().optional(),
})
export type AddTask = z.infer<typeof AddTaskSchema>

export const AddBlockerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  affectedTasks: z.array(z.string()),
})
export type AddBlocker = z.infer<typeof AddBlockerSchema>

export const ResolveBlockerSchema = z.object({
  index: z.number().int().min(0),
})
export type ResolveBlocker = z.infer<typeof ResolveBlockerSchema>

export const UpdateMetricsSchema = z.object({
  costs: z.object({
    invested: z.number().min(0).optional(),
    revenue: z.number().min(0).optional(),
    balance: z.number().optional(),
  }).optional(),
  users: z.object({
    signups: z.number().min(0).int().optional(),
    paid: z.number().min(0).int().optional(),
    churned: z.number().min(0).int().optional(),
  }).optional(),
})
export type UpdateMetrics = z.infer<typeof UpdateMetricsSchema>

export const UpdateMilestoneSchema = z.object({
  phaseId: z.string().min(1),
  milestoneId: z.string().min(1),
  status: MilestoneStatusEnum,
})
export type UpdateMilestone = z.infer<typeof UpdateMilestoneSchema>
