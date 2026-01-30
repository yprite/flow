interface MetricsCardProps {
  title: string
  value: number
  format: 'currency' | 'number'
  trend: 'positive' | 'negative' | 'neutral'
}

export default function MetricsCard({ title, value, format, trend }: MetricsCardProps) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return `₩${val.toLocaleString('ko-KR')}`
    }
    return val.toLocaleString('ko-KR')
  }

  const getTrendColor = () => {
    if (trend === 'positive') return 'from-emerald-500 to-emerald-300'
    if (trend === 'negative') return 'from-red-500 to-red-300'
    return 'from-slate-500 to-slate-300'
  }

  const getTrendIndicator = () => {
    if (trend === 'positive') return '▲'
    if (trend === 'negative') return '▼'
    return '━'
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-sm border border-slate-700/50 p-6 overflow-hidden group hover:border-slate-600 transition-all duration-300">
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getTrendColor()} opacity-10 blur-2xl`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            {title}
          </h3>
          <span className={`text-lg font-mono bg-gradient-to-r ${getTrendColor()} bg-clip-text text-transparent`}>
            {getTrendIndicator()}
          </span>
        </div>

        <div className="font-mono font-bold text-3xl text-slate-200 mb-2">
          {formatValue(value)}
        </div>

        {/* Minimal progress bar */}
        <div className="h-[2px] bg-slate-800 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getTrendColor()} animate-diagonal-wipe`}
          />
        </div>
      </div>
    </div>
  )
}
