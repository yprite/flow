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
    <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 mb-8 overflow-hidden">
      {/* Animated scan line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-pulse" />

      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-lg font-mono font-bold text-slate-300 uppercase tracking-wider">
          Mission Timeline
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-700 to-transparent" />
      </div>

      <div className="relative">
        {/* Progress track */}
        <div className="absolute top-8 left-0 right-0 h-[2px] bg-slate-700">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 transition-all duration-1000"
            style={{
              width: `${((currentPhaseIndex + 1) / phases.length) * 100}%`
            }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {phases.map((phase, index) => {
            const isActive = index === currentPhaseIndex
            const isComplete = index < currentPhaseIndex
            const isPending = index > currentPhaseIndex

            return (
              <div
                key={phase.id}
                className="relative flex flex-col items-center group"
              >
                {/* Node */}
                <div
                  className={`
                    relative z-10 w-16 h-16 flex items-center justify-center
                    border-2 transition-all duration-500
                    ${isActive
                      ? 'border-cyan-400 bg-cyan-500/20 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : isComplete
                      ? 'border-emerald-400 bg-emerald-500/20'
                      : 'border-slate-600 bg-slate-800/50'
                    }
                  `}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }}
                >
                  <span
                    className={`font-mono font-bold text-lg ${
                      isActive || isComplete ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Label */}
                <div className="mt-6 text-center">
                  <p
                    className={`
                      text-sm font-mono font-semibold mb-1
                      ${isActive
                        ? 'text-cyan-300'
                        : isComplete
                        ? 'text-emerald-300'
                        : 'text-slate-500'
                      }
                    `}
                  >
                    {phase.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-600 uppercase">
                    {phase.duration}
                  </p>
                  {phase.progress > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-mono text-slate-400">
                        {phase.progress}% COMPLETE
                      </div>
                    </div>
                  )}
                </div>

                {/* Active pulse */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16">
                    <div className="absolute inset-0 border-2 border-cyan-400 opacity-20 animate-ping"
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
