'use client'

interface MetricsCardProps {
  costs: {
    invested: number
    revenue: number
    balance: number
  }
  users: {
    signups: number
    paid: number
    churned: number
  }
}

export default function MetricsCard({ costs, users }: MetricsCardProps) {
  const formatCurrency = (val: number) => {
    return `₩${val.toLocaleString('ko-KR')}`
  }

  const metrics = {
    invested: { label: '투자', value: costs.invested, isCurrency: true },
    revenue: { label: '수익', value: costs.revenue, isCurrency: true },
    balance: { label: '잔액', value: costs.balance, isCurrency: true },
    signups: { label: '가입', value: users.signups, isCurrency: false },
    paid: { label: '유료', value: users.paid, isCurrency: false },
    churned: { label: '이탈', value: users.churned, isCurrency: false }
  }

  return (
    <div className="bg-[#FF6B4A] rounded-[32px] p-6 h-[420px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#8B3A28]">
          Account
        </h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-black/10 rounded-full text-xs font-medium">
            Monthly
          </button>
          <button className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium">
            All Time
          </button>
        </div>
      </div>

      {/* Large Balance Display */}
      <div className="mb-4">
        <div className="text-6xl font-bold text-black/90 mb-2">
          {formatCurrency(costs.balance)}
        </div>
        <div className="text-sm text-black/60">
          Current balance
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 content-start">
        {Object.entries(metrics).map(([key, { label, value, isCurrency }]) => (
          <div key={key} className="bg-black/10 rounded-2xl p-3">
            <div className="text-xs text-black/60 mb-1">{label}</div>
            <div className="text-lg font-bold text-black/90">
              {isCurrency ? formatCurrency(value) : value.toLocaleString('ko-KR')}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="text-xs text-black/60 mt-4">
        Last updated: {new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  )
}
