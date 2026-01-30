import { Blocker } from '@/lib/types'

interface BlockerLogProps {
  blockers: Blocker[]
}

export default function BlockerLog({ blockers }: BlockerLogProps) {
  if (blockers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-mono font-bold text-slate-300 uppercase tracking-wider">
            System Status
          </h3>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-700 to-transparent" />
        </div>

        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-mono text-emerald-300 uppercase">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-lg font-mono font-bold text-slate-300 uppercase tracking-wider">
          Incident Log
        </h3>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-700 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-mono text-red-400">{blockers.filter(b => !b.resolved).length} ACTIVE</span>
        </div>
      </div>

      <div className="space-y-3">
        {blockers.map((blocker, index) => (
          <div
            key={index}
            className={`
              relative p-4 border-l-2 transition-all duration-300
              ${blocker.resolved
                ? 'border-slate-600 bg-slate-800/30'
                : 'border-red-500 bg-red-900/10'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`
                  w-1.5 h-1.5 rounded-full
                  ${blocker.resolved ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}
                `} />
                <h4 className={`
                  font-mono font-semibold text-sm
                  ${blocker.resolved ? 'text-slate-400 line-through' : 'text-slate-200'}
                `}>
                  {blocker.title}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-600">
                {new Date(blocker.date).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <p className="text-sm text-slate-400 mb-2 ml-5">
              {blocker.description}
            </p>

            {blocker.affectedTasks.length > 0 && (
              <div className="ml-5 flex items-center gap-2 text-[10px] font-mono text-slate-600">
                <span>IMPACT:</span>
                {blocker.affectedTasks.map((task, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded">
                    {task}
                  </span>
                ))}
              </div>
            )}

            {blocker.resolved && blocker.resolvedAt && (
              <div className="mt-2 ml-5 text-[10px] font-mono text-emerald-400">
                RESOLVED: {new Date(blocker.resolvedAt).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
