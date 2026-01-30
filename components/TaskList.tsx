import { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  variant: 'cyan' | 'amber'
}

export default function TaskList({ tasks, variant }: TaskListProps) {
  const getStatusIndicator = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      case 'in_progress':
        return <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      case 'blocked':
        return <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
      default:
        return <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
    }
  }

  const accentColor = variant === 'cyan' ? 'cyan' : 'amber'

  return (
    <div className="space-y-1">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="group flex items-start gap-3 p-2 hover:bg-slate-800/30 transition-colors cursor-pointer border-l-2 border-transparent hover:border-${accentColor}-500/50"
          style={{
            animation: `slideInBlur 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            animationDelay: `${index * 30}ms`,
            opacity: 0
          }}
        >
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            {getStatusIndicator(task.status)}
            <span className="text-[10px] font-mono text-slate-600 uppercase">
              {task.status === 'completed' && 'DONE'}
              {task.status === 'in_progress' && 'ACTIVE'}
              {task.status === 'blocked' && 'BLOCK'}
              {task.status === 'pending' && 'QUEUE'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              task.status === 'completed'
                ? 'text-slate-400 line-through'
                : 'text-slate-200'
            }`}>
              {task.title}
            </p>

            <div className="flex items-center gap-2 mt-1">
              {task.category && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800/50 text-slate-500 border border-slate-700 rounded">
                  {task.category.toUpperCase()}
                </span>
              )}
              {task.blockedBy && (
                <span className="text-[10px] font-mono text-red-400">
                  BLOCKED BY: {task.blockedBy}
                </span>
              )}
            </div>
          </div>

          {task.completedAt && (
            <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
              {new Date(task.completedAt).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit'
              })}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
