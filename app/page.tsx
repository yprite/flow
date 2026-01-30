import { loadDashboardData } from '@/lib/data-loader'
import TrackCard from '@/components/TrackCard'
import PhaseTimeline from '@/components/PhaseTimeline'
import MetricsCard from '@/components/MetricsCard'
import BlockerLog from '@/components/BlockerLog'

export default function Home() {
  const data = loadDashboardData()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            🚀 {data.metadata.projectName} 사업 대시보드
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            최종 업데이트: {new Date(data.metadata.lastUpdated).toLocaleDateString('ko-KR')}
          </p>
        </header>

        {/* Phase Timeline */}
        <PhaseTimeline phases={data.phases} />

        {/* Tracks - 병렬 표시 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TrackCard track={data.tracks.preparation} />
          <TrackCard track={data.tracks.development} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MetricsCard
            title="비용"
            metrics={data.metrics.costs}
            icon="💰"
          />
          <MetricsCard
            title="유저"
            metrics={data.metrics.users}
            icon="👥"
          />
        </div>

        {/* Blocker Log */}
        <BlockerLog blockers={data.blockers} />
      </div>
    </div>
  )
}
