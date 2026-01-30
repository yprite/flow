import { Task } from '@/lib/types'
import { getStatusIcon, getStatusColor } from '@/lib/data-loader'

interface TaskListProps {
  tasks: Task[]
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">
            {getStatusIcon(task.status)}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.title}
            </p>
            {task.category && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                {task.category}
              </span>
            )}
            {task.blockedBy && (
              <p className="text-xs text-red-600 mt-1">
                🚫 차단됨: {task.blockedBy}
              </p>
            )}
            {task.notes && (
              <p className="text-xs text-slate-500 mt-1">{task.notes}</p>
            )}
          </div>
          {task.completedAt && (
            <span className="text-xs text-slate-400 flex-shrink-0">
              {new Date(task.completedAt).toLocaleDateString('ko-KR')}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
