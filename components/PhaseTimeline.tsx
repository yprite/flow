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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">사업 단계</h2>

      <div className="flex items-center justify-between">
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${index <= currentPhaseIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                  }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm font-medium text-center
                  ${index === currentPhaseIndex
                    ? 'text-blue-600 font-bold'
                    : index < currentPhaseIndex
                    ? 'text-emerald-600'
                    : 'text-slate-500'
                  }`}
              >
                {phase.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">{phase.duration}</p>
              {phase.progress > 0 && (
                <p className="text-xs font-semibold text-blue-600 mt-1">
                  {phase.progress}%
                </p>
              )}
            </div>

            {index < phases.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2
                  ${index < currentPhaseIndex
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                  }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
