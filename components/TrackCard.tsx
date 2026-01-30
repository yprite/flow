'use client'

import { Track } from '@/lib/types'

interface TrackCardProps {
  track: Track
  variant: 'mustard' | 'lavender'
}

export default function TrackCard({ track, variant }: TrackCardProps) {
  const completedCount = track.tasks.filter(t => t.status === 'completed').length
  const totalCount = track.tasks.length

  const bgColor = variant === 'mustard' ? 'bg-[#9A8C44]' : 'bg-[#A39DC2]'
  const textColor = variant === 'mustard' ? 'text-[#5A5228]' : 'text-[#514D7A]'

  return (
    <div className={`${bgColor} rounded-[32px] p-6 h-[420px] flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${textColor}`}>
          {track.name}
        </h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-black/10 rounded-full text-xs font-medium">
            Weekly
          </button>
          <button className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium">
            Daily
          </button>
        </div>
      </div>

      {/* Large Progress Number */}
      <div className="mb-4">
        <div className="text-6xl font-bold text-black/90 mb-2">
          {track.progress}%
        </div>
        <div className="text-sm text-black/60">
          {completedCount} of {totalCount} tasks complete
        </div>
      </div>

      {/* Simple Bar Chart Visualization */}
      <div className="flex-1 flex items-end gap-1 mb-4">
        {track.tasks.slice(0, 12).map((task, i) => {
          const height = task.status === 'completed' ? 100 : task.status === 'in_progress' ? 60 : 30
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className={`w-full rounded-t transition-all ${
                  task.status === 'completed'
                    ? 'bg-black/70'
                    : task.status === 'in_progress'
                    ? 'bg-black/40'
                    : 'bg-black/15'
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom Info */}
      <div className="text-xs text-black/60">
        {track.tasks.filter(t => t.status === 'in_progress').length > 0 && (
          <span>
            {track.tasks.filter(t => t.status === 'in_progress').length} tasks in progress
          </span>
        )}
      </div>
    </div>
  )
}
