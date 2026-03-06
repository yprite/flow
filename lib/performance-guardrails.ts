export interface PerformanceGuardrail {
  metric: 'LCP' | 'INP' | 'CLS' | 'JS Budget'
  target: string
  rationale: string
}

export const PERFORMANCE_GUARDRAILS: PerformanceGuardrail[] = [
  {
    metric: 'LCP',
    target: '<= 2.5s (p75)',
    rationale: 'Landing pages must reach first meaningful content quickly on mobile.',
  },
  {
    metric: 'INP',
    target: '<= 200ms (p75)',
    rationale: 'Interactive filters and query controls should remain responsive.',
  },
  {
    metric: 'CLS',
    target: '<= 0.1 (p75)',
    rationale: 'Avoid layout shift around charts and metric cards.',
  },
  {
    metric: 'JS Budget',
    target: '<= 200KB initial gzip',
    rationale: 'Preserve crawlability and mobile rendering speed.',
  },
]
