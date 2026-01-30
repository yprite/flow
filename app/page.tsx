import { loadDashboardData } from '@/lib/data-loader'
import TrackCard from '@/components/TrackCard'
import PhaseTimeline from '@/components/PhaseTimeline'
import MetricsCard from '@/components/MetricsCard'
import BlockerLog from '@/components/BlockerLog'

export default function Home() {
  const data = loadDashboardData()

  return (
    <div className="min-h-screen relative p-6 md:p-12">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* Header - Staggered reveal */}
        <header className="mb-12 animate-slide-blur" style={{ animationDelay: '0ms' }}>
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="text-5xl md:text-6xl font-mono font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                {data.metadata.projectName}
              </span>
            </h1>
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-slate-400">MISSION CONTROL</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">
              LAST SYNC: {new Date(data.metadata.lastUpdated).toLocaleDateString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </header>

        {/* Phase Timeline */}
        <div className="animate-slide-blur" style={{ animationDelay: '100ms' }}>
          <PhaseTimeline phases={data.phases} />
        </div>

        {/* Tracks - Diagonal layout with stagger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="animate-slide-blur" style={{ animationDelay: '200ms' }}>
            <TrackCard track={data.tracks.preparation} variant="cyan" />
          </div>
          <div className="animate-slide-blur" style={{ animationDelay: '300ms' }}>
            <TrackCard track={data.tracks.development} variant="amber" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="animate-slide-blur" style={{ animationDelay: '400ms' }}>
            <MetricsCard
              title="투자"
              value={data.metrics.costs.invested}
              format="currency"
              trend="neutral"
            />
          </div>
          <div className="animate-slide-blur" style={{ animationDelay: '450ms' }}>
            <MetricsCard
              title="매출"
              value={data.metrics.costs.revenue}
              format="currency"
              trend="positive"
            />
          </div>
          <div className="animate-slide-blur" style={{ animationDelay: '500ms' }}>
            <MetricsCard
              title="유료 유저"
              value={data.metrics.users.paid}
              format="number"
              trend="positive"
            />
          </div>
          <div className="animate-slide-blur" style={{ animationDelay: '550ms' }}>
            <MetricsCard
              title="손익"
              value={data.metrics.costs.balance}
              format="currency"
              trend={data.metrics.costs.balance >= 0 ? 'positive' : 'negative'}
            />
          </div>
        </div>

        {/* Blocker Log */}
        <div className="animate-slide-blur" style={{ animationDelay: '600ms' }}>
          <BlockerLog blockers={data.blockers} />
        </div>
      </div>
    </div>
  )
}
