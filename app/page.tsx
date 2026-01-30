import { loadDashboardData } from '@/lib/data-loader'
import TrackCard from '@/components/TrackCard'
import PhaseTimeline from '@/components/PhaseTimeline'
import MetricsCard from '@/components/MetricsCard'
import BlockerLog from '@/components/BlockerLog'

export default function Home() {
  const data = loadDashboardData()

  return (
    <div className="min-h-screen p-5 md:p-8 max-w-[1400px] mx-auto">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between mb-8 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold">
          YOUR BUSINESS GOAL
        </h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
            Wallet
          </button>
          <button className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
            Account
          </button>
          <button className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
            KO
          </button>
        </div>
      </header>

      {/* Main Progress Card */}
      <div
        className="bg-[#F5F5F0] rounded-[32px] p-8 mb-6 animate-scale-in"
        style={{ animationDelay: '100ms', opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-black">Your Progress</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">DETAILED</span>
            <div className="relative w-12 h-6 bg-black rounded-full">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>

        <PhaseTimeline phases={data.phases} />
      </div>

      {/* Color Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Mustard Card - Preparation */}
        <div
          className="animate-scale-in"
          style={{ animationDelay: '200ms', opacity: 0 }}
        >
          <TrackCard track={data.tracks.preparation} variant="mustard" />
        </div>

        {/* Lavender Card - Development */}
        <div
          className="animate-scale-in"
          style={{ animationDelay: '250ms', opacity: 0 }}
        >
          <TrackCard track={data.tracks.development} variant="lavender" />
        </div>

        {/* Coral Card - Metrics */}
        <div
          className="animate-scale-in"
          style={{ animationDelay: '300ms', opacity: 0 }}
        >
          <MetricsCard
            costs={data.metrics.costs}
            users={data.metrics.users}
          />
        </div>
      </div>

      {/* Bottom Section - Blockers */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: '350ms', opacity: 0 }}
      >
        <BlockerLog blockers={data.blockers} />
      </div>
    </div>
  )
}
