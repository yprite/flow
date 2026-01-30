import { Track } from '@/lib/types'
import ProgressBar from './ProgressBar'
import TaskList from './TaskList'

interface TrackCardProps {
  track: Track
}

export default function TrackCard({ track }: TrackCardProps) {
  const completedCount = track.tasks.filter(t => t.status === 'completed').length
  const totalCount = track.tasks.length

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {track.name}
        </h2>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            {completedCount} / {totalCount} 완료
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-900">
            {track.progress}%
          </span>
        </div>
      </div>

      <ProgressBar progress={track.progress} className="mb-6" />

      <div className="max-h-96 overflow-y-auto">
        <TaskList tasks={track.tasks} />
      </div>
    </div>
  )
}
