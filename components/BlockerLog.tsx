import { Blocker } from '@/lib/types'

interface BlockerLogProps {
  blockers: Blocker[]
}

export default function BlockerLog({ blockers }: BlockerLogProps) {
  if (blockers.length === 0) {
    return (
      <div className="bg-[#C0E6DB] rounded-[32px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#3B7A66]">
            Blocker Log
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 font-medium">All Clear</span>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl font-bold text-emerald-700 mb-2">
            No Blockers
          </div>
          <div className="text-sm text-emerald-600">
            All systems operational
          </div>
        </div>
      </div>
    )
  }

  const activeBlockers = blockers.filter(b => !b.resolved).length

  return (
    <div className="bg-[#C0E6DB] rounded-[32px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#3B7A66]">
          Blocker Log
        </h3>
        <div className="flex items-center gap-2">
          {activeBlockers > 0 ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-700 font-medium">
                {activeBlockers} Active
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">Resolved</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {blockers.map((blocker, index) => (
          <div
            key={index}
            className={`
              p-4 rounded-2xl transition-all
              ${blocker.resolved
                ? 'bg-black/5 border border-black/10'
                : 'bg-red-100 border border-red-200'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`
                  w-1.5 h-1.5 rounded-full
                  ${blocker.resolved ? 'bg-emerald-500' : 'bg-red-500'}
                `} />
                <h4 className={`
                  font-semibold text-sm
                  ${blocker.resolved ? 'text-black/40 line-through' : 'text-black/80'}
                `}>
                  {blocker.title}
                </h4>
              </div>
              <span className="text-xs text-black/50">
                {new Date(blocker.date).toLocaleDateString('ko-KR')}
              </span>
            </div>

            <p className={`text-sm mb-2 ${blocker.resolved ? 'text-black/40' : 'text-black/60'}`}>
              {blocker.description}
            </p>

            {blocker.affectedTasks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {blocker.affectedTasks.map((task, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-black/10 rounded-full text-xs text-black/60"
                  >
                    {task}
                  </span>
                ))}
              </div>
            )}

            {blocker.resolved && blocker.resolvedAt && (
              <div className="mt-2 text-xs text-emerald-600">
                Resolved: {new Date(blocker.resolvedAt).toLocaleDateString('ko-KR')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
