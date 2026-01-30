import { Blocker } from '@/lib/types'

interface BlockerLogProps {
  blockers: Blocker[]
}

export default function BlockerLog({ blockers }: BlockerLogProps) {
  if (blockers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          ⚠️ 블로커 로그
        </h3>
        <p className="text-slate-500 text-sm text-center py-8">
          현재 블로커가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        ⚠️ 블로커 로그
      </h3>

      <div className="space-y-4">
        {blockers.map((blocker, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4
              ${blocker.resolved
                ? 'border-slate-300 bg-slate-50'
                : 'border-red-500 bg-red-50'
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4
                className={`font-semibold
                  ${blocker.resolved ? 'text-slate-600' : 'text-red-700'}
                `}
              >
                {blocker.title}
              </h4>
              <span className="text-xs text-slate-500">
                {new Date(blocker.date).toLocaleDateString('ko-KR')}
              </span>
            </div>

            <p className="text-sm text-slate-700 mb-2">
              {blocker.description}
            </p>

            {blocker.affectedTasks.length > 0 && (
              <div className="text-xs text-slate-600">
                영향받는 태스크: {blocker.affectedTasks.join(', ')}
              </div>
            )}

            {blocker.resolved && blocker.resolvedAt && (
              <div className="mt-2 text-xs text-emerald-600 font-medium">
                ✅ 해결됨: {new Date(blocker.resolvedAt).toLocaleDateString('ko-KR')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
