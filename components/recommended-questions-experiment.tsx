'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ExperimentVariant = 'control' | 'treatment'

interface RecommendedQuestionsExperimentProps {
  slug: string
  recommendedQuestions: string[]
}

const EXPERIMENT_ID = 'w1_p0_recommended_questions_5'
const STORAGE_KEYS = {
  variant: 'growth:rq5:variant',
  userId: 'growth:anonymous-user-id',
  firstQuery: 'growth:rq5:first-query-completed',
  heroVariant: 'growth:hero-copy:variant',
}

function pickVariant(): ExperimentVariant {
  if (typeof window === 'undefined') return 'control'

  const cached = window.localStorage.getItem(STORAGE_KEYS.variant)
  if (cached === 'control' || cached === 'treatment') {
    return cached
  }

  const variant: ExperimentVariant = Math.random() < 0.5 ? 'control' : 'treatment'
  window.localStorage.setItem(STORAGE_KEYS.variant, variant)
  return variant
}

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'anonymous-server'

  const cached = window.localStorage.getItem(STORAGE_KEYS.userId)
  if (cached) return cached

  const generated = typeof crypto.randomUUID === 'function'
    ? `anon-${crypto.randomUUID()}`
    : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  window.localStorage.setItem(STORAGE_KEYS.userId, generated)
  return generated
}

function getHeroVariant(): string {
  if (typeof window === 'undefined') return 'unknown'
  return window.localStorage.getItem(STORAGE_KEYS.heroVariant) || 'unknown'
}

async function postAnalyticsEvent(payload: {
  eventName: 'landing_viewed' | 'first_query_completed' | 'query_executed'
  userId: string
  properties: Record<string, string | number | boolean>
}) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // 실험 UI 동작을 깨지 않기 위해 계측 오류는 무시
  }
}

export default function RecommendedQuestionsExperiment({
  slug,
  recommendedQuestions,
}: RecommendedQuestionsExperimentProps) {
  const [variant, setVariant] = useState<ExperimentVariant>('control')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const landingTrackedRef = useRef(false)
  const topQuestions = useMemo(() => recommendedQuestions.slice(0, 5), [recommendedQuestions])

  useEffect(() => {
    setVariant(pickVariant())
  }, [])

  useEffect(() => {
    if (landingTrackedRef.current) return
    landingTrackedRef.current = true

    const userId = getOrCreateUserId()
    void postAnalyticsEvent({
      eventName: 'landing_viewed',
      userId,
      properties: {
        channel: 'seo',
        landingPage: `/bitcoin/${slug}`,
        experimentId: EXPERIMENT_ID,
        variant,
        heroCopyVariant: getHeroVariant(),
        recommendedQuestionsShown: variant === 'treatment',
      },
    })
  }, [slug, variant])

  const handleQuestionClick = async (question: string, index: number) => {
    const userId = getOrCreateUserId()
    const isFirstQuery = typeof window !== 'undefined' &&
      !window.localStorage.getItem(STORAGE_KEYS.firstQuery)
    const eventName = isFirstQuery ? 'first_query_completed' : 'query_executed'

    if (isFirstQuery && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.firstQuery, 'true')
    }

    await postAnalyticsEvent({
      eventName,
      userId,
      properties: {
        queryType: `${slug}-recommended-q${index + 1}`,
        channel: 'seo',
        landingPage: `/bitcoin/${slug}`,
        experimentId: EXPERIMENT_ID,
        variant,
        heroCopyVariant: getHeroVariant(),
        questionText: question,
        position: index + 1,
      },
    })

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(question)
      } catch {
        // Clipboard 권한 실패는 실험 흐름에 영향 없음
      }
    }

    setCopiedIndex(index)
  }

  return (
    <section
      data-testid="recommended-questions-experiment"
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">추천 질문 5개 실험</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            variant === 'treatment'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {variant === 'treatment' ? '실험군' : '대조군'}
        </span>
      </div>

      {variant === 'treatment' ? (
        <>
          <p className="text-sm text-slate-600 mt-2">
            질문을 클릭하면 예시 프롬프트가 복사되고, 첫 질문 완료/추가 질문 이벤트가 기록됩니다.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {topQuestions.map((question, index) => (
              <button
                key={question}
                type="button"
                data-testid="recommended-question-button"
                onClick={() => void handleQuestionClick(question, index)}
                className="text-left rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 px-4 py-3 transition-colors"
              >
                <p className="text-xs font-semibold text-indigo-600 mb-1">추천 {index + 1}</p>
                <p className="text-sm text-slate-800">{question}</p>
                {copiedIndex === index && (
                  <p className="text-xs text-emerald-600 mt-2">복사됨</p>
                )}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-600 mt-3">
          현재는 기본 랜딩(대조군)입니다. 실험군에서만 추천 질문 5개가 노출됩니다.
        </p>
      )}
    </section>
  )
}
