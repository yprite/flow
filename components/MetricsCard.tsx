interface MetricsCardProps {
  title: string
  metrics: {
    [key: string]: number
  }
  icon?: string
}

export default function MetricsCard({ title, metrics, icon }: MetricsCardProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR')
  }

  const formatCurrency = (num: number) => {
    return `₩${formatNumber(num)}`
  }

  const isCostMetric = title.includes('비용')

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {icon} {title}
      </h3>

      <div className="space-y-3">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-slate-600 capitalize">
              {key === 'invested' && '투자'}
              {key === 'revenue' && '매출'}
              {key === 'balance' && '손익'}
              {key === 'signups' && '가입'}
              {key === 'paid' && '유료'}
              {key === 'churned' && '이탈'}
            </span>
            <span
              className={`text-lg font-bold
                ${key === 'balance' && value < 0 ? 'text-red-600' : 'text-slate-900'}
                ${key === 'balance' && value > 0 ? 'text-emerald-600' : ''}
              `}
            >
              {isCostMetric ? formatCurrency(value) : `${formatNumber(value)}명`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
