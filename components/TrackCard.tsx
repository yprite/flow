'use client'

import { Track } from '@/lib/types'
import TaskList from './TaskList'

interface TrackCardProps {
  track: Track
  variant: 'cyan' | 'amber'
}

export default function TrackCard({ track, variant }: TrackCardProps) {
  const completedCount = track.tasks.filter(t => t.status === 'completed').length
  const totalCount = track.tasks.length

  const accentColor = variant === 'cyan'
    ? 'from-cyan-500 to-cyan-300'
    : 'from-amber-500 to-amber-300'

  const borderColor = variant === 'cyan'
    ? 'border-cyan-500/30'
    : 'border-amber-500/30'

  const glowClass = variant === 'cyan' ? 'glow-cyan' : 'glow-amber'

  return (
    <div className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border ${borderColor} rounded-none p-8 overflow-hidden group hover:scale-[1.01] transition-transform duration-300 ${glowClass}`}>
      {/* Diagonal stripe pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }} />
      </div>

      {/* Diagonal progress bar */}
      <div className="absolute top-0 right-0 w-2 h-full bg-slate-700/50">
        <div
          className={`absolute bottom-0 w-full bg-gradient-to-t ${accentColor} transition-all duration-1000 ease-out`}
          style={{ height: `${track.progress}%` }}
        />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-mono font-bold tracking-tight">
              <span className={`bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
                {track.name}
              </span>
            </h2>
            <div className={`text-3xl font-mono font-bold bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
              {track.progress}
              <span className="text-lg">%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded">
              {completedCount}/{totalCount} COMPLETE
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-700 to-transparent" />
          </div>
        </div>

        {/* Task list with custom scrollbar */}
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <TaskList tasks={track.tasks} variant={variant} />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${variant === 'cyan' ? 'rgba(165, 243, 252, 0.3)' : 'rgba(251, 191, 36, 0.3)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${variant === 'cyan' ? 'rgba(165, 243, 252, 0.5)' : 'rgba(251, 191, 36, 0.5)'};
        }
      `}</style>
    </div>
  )
}
