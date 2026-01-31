'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Target,
  Rocket,
  Users,
  Wallet,
  Calendar,
  Flag,
  Plus,
  X,
  Check,
  Loader2,
  ChevronDown,
} from 'lucide-react'

import { useDashboard } from '@/lib/use-dashboard'
import { DashboardData, Task } from '@/lib/types'
import { TaskStatus, Track } from '@/lib/validation'

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: '완료'
  },
  in_progress: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: '진행중'
  },
  blocked: {
    icon: AlertCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    label: '블로커'
  },
  pending: {
    icon: Circle,
    color: 'text-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    label: '대기'
  },
}

const statusOptions: TaskStatus[] = ['pending', 'in_progress', 'completed', 'blocked']

export default function Home() {
  const { data, isLoading, error, updateTaskStatus, addTask, updateMilestone, resolveBlocker } = useDashboard()
  const [showAddTask, setShowAddTask] = useState<Track | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-600">데이터를 불러오는데 실패했습니다</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  const allTasks = [...data.tracks.initialSetup.tasks, ...data.tracks.preparation.tasks, ...data.tracks.development.tasks]
  const completedTasks = allTasks.filter(t => t.status === 'completed').length
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
  const blockedTasks = allTasks.filter(t => t.status === 'blocked').length
  const pendingTasks = allTasks.filter(t => t.status === 'pending').length

  const activeBlockers = data.blockers.filter(b => !b.resolved)

  const handleAddTask = async (track: Track) => {
    if (!newTaskTitle.trim() || !newTaskCategory.trim()) return
    setIsSubmitting(true)
    await addTask({
      title: newTaskTitle,
      category: newTaskCategory,
      track,
    })
    setNewTaskTitle('')
    setNewTaskCategory('')
    setShowAddTask(null)
    setIsSubmitting(false)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status)
  }

  const handleMilestoneToggle = async (phaseId: string, milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    await updateMilestone(phaseId, milestoneId, newStatus as 'completed' | 'pending')
  }

  const handleResolveBlocker = async (index: number) => {
    await resolveBlocker(index)
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{data.metadata.projectName}</h1>
              <p className="text-slate-500 text-sm">사업 진행 대시보드</p>
            </div>
          </div>
        </motion.header>

        {/* Blocker Alert */}
        <AnimatePresence>
          {activeBlockers.length > 0 && (
            <motion.div
              data-testid="blocker-alert"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 shadow-soft"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-rose-700 mb-2">{activeBlockers.length}개의 블로커가 진행을 막고 있어요</h3>
                  {activeBlockers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <p className="text-sm text-rose-600">{b.title}: {b.description}</p>
                      <button
                        onClick={() => handleResolveBlocker(data.blockers.indexOf(b))}
                        className="text-xs px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
                      >
                        해결됨
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          data-testid="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10"
        >
          <StatCard
            icon={Sparkles}
            label="초기 셋업"
            value={`${data.tracks.initialSetup.progress}%`}
            subtext={`${data.tracks.initialSetup.tasks.filter(t => t.status === 'completed').length}/${data.tracks.initialSetup.tasks.length} 완료`}
            color="sky"
          />
          <StatCard
            icon={Target}
            label="사업 준비"
            value={`${data.tracks.preparation.progress}%`}
            subtext={`${data.tracks.preparation.tasks.filter(t => t.status === 'completed').length}/${data.tracks.preparation.tasks.length} 완료`}
            color="indigo"
          />
          <StatCard
            icon={Rocket}
            label="개발"
            value={`${data.tracks.development.progress}%`}
            subtext={`${data.tracks.development.tasks.filter(t => t.status === 'completed').length}/${data.tracks.development.tasks.length} 완료`}
            color="violet"
          />
          <StatCard
            icon={Users}
            label="유료 고객"
            value={data.metrics.users.paid.toString()}
            subtext="목표: 325명"
            color="emerald"
          />
          <StatCard
            icon={Wallet}
            label="잔액"
            value={`${(data.metrics.costs.balance / 10000).toFixed(0)}만원`}
            subtext={`투자: ${(data.metrics.costs.invested / 10000).toFixed(0)}만원`}
            color="amber"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">진행 타임라인</h2>
              </div>

              <div className="relative" data-testid="timeline">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-200" />

                <div className="space-y-6">
                  {data.phases.map((phase, index) => {
                    const completedMilestones = phase.milestones.filter(m => m.status === 'completed').length
                    const isComplete = completedMilestones === phase.milestones.length && phase.milestones.length > 0
                    const isCurrent = !isComplete && (index === 0 || data.phases[index - 1].milestones.every(m => m.status === 'completed'))

                    return (
                      <div key={phase.id} className="relative pl-12" data-testid="phase-node">
                        <div className={`
                          absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center
                          ${isComplete
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-200'
                            : isCurrent
                              ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-lg shadow-indigo-200 animate-pulse'
                              : 'bg-slate-100 border-2 border-slate-200'
                          }
                        `}>
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className={`
                          p-4 rounded-2xl border transition-all
                          ${isCurrent
                            ? 'bg-indigo-50 border-indigo-200'
                            : isComplete
                              ? 'bg-emerald-50/50 border-emerald-100'
                              : 'bg-slate-50 border-slate-100'
                          }
                        `}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-semibold ${isCurrent ? 'text-indigo-700' : isComplete ? 'text-emerald-700' : 'text-slate-600'}`}>
                              {phase.name}
                            </h3>
                            <span className="text-xs text-slate-400">{phase.duration}</span>
                          </div>

                          <div className="space-y-1.5">
                            {phase.milestones.map((milestone) => (
                              <button
                                key={milestone.id}
                                onClick={() => handleMilestoneToggle(phase.id, milestone.id, milestone.status)}
                                className="flex items-center gap-2 w-full text-left hover:bg-white/50 rounded-lg p-1 -ml-1 transition-colors cursor-pointer"
                                data-testid="milestone"
                              >
                                {milestone.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                                <span className={`text-sm ${milestone.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                  {milestone.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Task Lists */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2 space-y-6"
          >
            {/* Task Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">태스크 현황</h2>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-4 rounded-2xl bg-emerald-50">
                  <div className="text-3xl font-bold text-emerald-600">{completedTasks}</div>
                  <div className="text-xs text-emerald-600 font-medium">완료</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-amber-50">
                  <div className="text-3xl font-bold text-amber-600">{inProgressTasks}</div>
                  <div className="text-xs text-amber-600 font-medium">진행중</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-rose-50">
                  <div className="text-3xl font-bold text-rose-600">{blockedTasks}</div>
                  <div className="text-xs text-rose-600 font-medium">블로커</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50">
                  <div className="text-3xl font-bold text-slate-600">{pendingTasks}</div>
                  <div className="text-xs text-slate-600 font-medium">대기</div>
                </div>
              </div>
            </div>

            {/* Track Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TaskTrackCard
                track={data.tracks.initialSetup}
                trackKey="initialSetup"
                gradient="from-sky-500 to-sky-600"
                lightBg="bg-sky-50"
                testId="track-initialSetup"
                onStatusChange={handleStatusChange}
                onAddTask={() => setShowAddTask('initialSetup')}
              />
              <TaskTrackCard
                track={data.tracks.preparation}
                trackKey="preparation"
                gradient="from-indigo-500 to-indigo-600"
                lightBg="bg-indigo-50"
                testId="track-preparation"
                onStatusChange={handleStatusChange}
                onAddTask={() => setShowAddTask('preparation')}
              />
              <TaskTrackCard
                track={data.tracks.development}
                trackKey="development"
                gradient="from-violet-500 to-violet-600"
                lightBg="bg-violet-50"
                testId="track-development"
                onStatusChange={handleStatusChange}
                onAddTask={() => setShowAddTask('development')}
              />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-slate-400"
          data-testid="last-updated"
        >
          마지막 업데이트: {new Date(data.metadata.lastUpdated).toLocaleDateString('ko-KR')}
        </motion.footer>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddTask(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    새 태스크 추가 ({showAddTask === 'initialSetup' ? '초기 셋업' : showAddTask === 'preparation' ? '사업 준비' : '개발'})
                  </h3>
                  <button
                    onClick={() => setShowAddTask(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="태스크 제목 입력"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">카테고리</label>
                    <input
                      type="text"
                      value={newTaskCategory}
                      onChange={e => setNewTaskCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="예: legal, infrastructure, core-features"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddTask(null)}
                      className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleAddTask(showAddTask)}
                      disabled={!newTaskTitle.trim() || !newTaskCategory.trim() || isSubmitting}
                      className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      추가
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType
  label: string
  value: string
  subtext: string
  color: 'sky' | 'indigo' | 'violet' | 'emerald' | 'amber'
}) {
  const colors = {
    sky: {
      gradient: 'from-sky-500 to-sky-600',
      shadow: 'shadow-sky-200',
      text: 'text-sky-600'
    },
    indigo: {
      gradient: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-200',
      text: 'text-indigo-600'
    },
    violet: {
      gradient: 'from-violet-500 to-violet-600',
      shadow: 'shadow-violet-200',
      text: 'text-violet-600'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-200',
      text: 'text-emerald-600'
    },
    amber: {
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-200',
      text: 'text-amber-600'
    }
  }
  const c = colors[color]

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100 hover:shadow-elevated transition-shadow" data-testid="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.gradient} ${c.shadow} shadow-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`text-3xl font-bold ${c.text} mb-1`}>{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-xs text-slate-400 mt-1">{subtext}</div>
    </div>
  )
}

function TaskTrackCard({ track, trackKey, gradient, lightBg, testId, onStatusChange, onAddTask }: {
  track: DashboardData['tracks']['preparation']
  trackKey: Track
  gradient: string
  lightBg: string
  testId: string
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onAddTask: () => void
}) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden" data-testid={testId}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} p-5`}>
        <div className="flex items-center justify-between text-white">
          <h3 className="font-bold text-lg">{track.name}</h3>
          <span className="text-3xl font-bold">{track.progress}%</span>
        </div>
        <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden" data-testid="progress-bar">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${track.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-white/80 text-sm">
            {track.tasks.filter(t => t.status === 'completed').length}/{track.tasks.length} 태스크 완료
          </span>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
        {track.tasks.map((task, index) => {
          const config = statusConfig[task.status]
          const Icon = config.icon
          const isExpanded = expandedTask === task.id

          return (
            <motion.div
              key={task.id}
              data-testid="task-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`
                rounded-xl border transition-all
                ${config.bg} ${config.border}
              `}
            >
              <div
                className="p-3 flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.title}
                  </div>
                  {task.blockedBy && task.status !== 'completed' && (
                    <div className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                      <ArrowRight className="w-3 h-3" />
                      <span>{task.blockedBy} 완료 후</span>
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${lightBg} text-slate-500 shrink-0`}>
                  {task.category}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {/* Status Selector */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                      <div className="text-xs text-slate-500 mb-2">상태 변경:</div>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(status => {
                          const statusCfg = statusConfig[status]
                          const isActive = task.status === status
                          return (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation()
                                onStatusChange(task.id, status)
                              }}
                              className={`
                                px-3 py-1 rounded-lg text-xs font-medium transition-all
                                ${isActive
                                  ? `${statusCfg.bg} ${statusCfg.color} ring-2 ring-offset-1 ring-current`
                                  : 'bg-white text-slate-500 hover:bg-slate-50'
                                }
                              `}
                            >
                              {statusCfg.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
