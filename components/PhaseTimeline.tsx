import { Phase } from '@/lib/types'

interface PhaseTimelineProps {
  phases: Phase[]
}

export default function PhaseTimeline({ phases }: PhaseTimelineProps) {
  const getCurrentPhaseIndex = () => {
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].progress < 100) return i
    }
    return phases.length - 1
  }

  const currentPhaseIndex = getCurrentPhaseIndex()
  const overallProgress = ((currentPhaseIndex + 1) / phases.length) * 100

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="text-6xl font-bold text-black mb-2">+{Math.round(overallProgress)}%</div>
        <div className="text-sm text-gray-600">Overall business progress</div>
      </div>

      {/* Phase Progress Bars */}
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isComplete = index < currentPhaseIndex
          const isActive = index === currentPhaseIndex
          const progressWidth = isComplete ? 100 : isActive ? phase.progress || 10 : 0

          return (
            <div key={phase.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-black/80">{phase.name}</span>
                {progressWidth > 0 && (
                  <span className="text-xs text-black/60">{Math.round(progressWidth)}%</span>
                )}
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black/70 rounded-full transition-all duration-700"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
