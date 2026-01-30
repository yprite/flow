interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  className?: string
}

export default function ProgressBar({ progress, label, className = '' }: ProgressBarProps) {
  const progressColor = progress === 100
    ? 'bg-emerald-500'
    : progress > 50
    ? 'bg-blue-500'
    : 'bg-amber-500'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-slate-700 font-medium">{label}</span>
          <span className="text-slate-600">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${progressColor} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
