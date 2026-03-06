'use client'

import { useEffect, useState } from 'react'

type HeroVariant = 'control' | 'value_copy'

interface LandingHeroCopyExperimentProps {
  slug: string
  defaultTitle: string
  defaultDescription: string
}

const EXPERIMENT_ID = 'w1_p0_landing_hero_copy_ab'
const STORAGE_KEYS = {
  variant: 'growth:hero-copy:variant',
  userId: 'growth:anonymous-user-id',
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

function pickHeroVariant(): HeroVariant {
  if (typeof window === 'undefined') return 'control'

  const cached = window.localStorage.getItem(STORAGE_KEYS.variant)
  if (cached === 'control' || cached === 'value_copy') {
    return cached
  }

  const variant: HeroVariant = Math.random() < 0.5 ? 'control' : 'value_copy'
  window.localStorage.setItem(STORAGE_KEYS.variant, variant)
  return variant
}

async function postSignupCompleted(payload: {
  userId: string
  properties: Record<string, string>
}) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'signup_completed',
        userId: payload.userId,
        source: 'web',
        properties: payload.properties,
      }),
      keepalive: true,
    })
  } catch {
    // 계측 실패 시에도 이동은 막지 않음
  }
}

export default function LandingHeroCopyExperiment({
  slug,
  defaultTitle,
  defaultDescription,
}: LandingHeroCopyExperimentProps) {
  const [variant, setVariant] = useState<HeroVariant>('control')

  useEffect(() => {
    setVariant(pickHeroVariant())
  }, [])

  const heroCopy = variant === 'value_copy'
    ? {
        title: '질문하면 바로 비트코인 온체인 답을 받으세요',
        description:
          '지갑·수수료·거래 추적 질문을 즉시 실행 가능한 형태로 제공해 첫 가치 도달 시간을 줄입니다.',
        ctaLabel: '무료로 바로 시작하기',
      }
    : {
        title: defaultTitle,
        description: defaultDescription,
        ctaLabel: '기본 흐름으로 시작하기',
      }

  const handleSignupClick = () => {
    const userId = getOrCreateUserId()
    void postSignupCompleted({
      userId,
      properties: {
        channel: 'seo',
        plan: 'free',
        landingPage: `/bitcoin/${slug}`,
        experimentId: EXPERIMENT_ID,
        variant,
      },
    })
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">
          Core Intent Landing
        </p>
        <span
          className={`text-[10px] px-2 py-1 rounded-full ${
            variant === 'value_copy'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {variant === 'value_copy' ? '히어로 실험군' : '히어로 대조군'}
        </span>
      </div>

      <h1 className="text-4xl font-bold text-slate-900">{heroCopy.title}</h1>
      <p className="text-slate-600 mt-3 max-w-3xl">{heroCopy.description}</p>

      <a
        href="/"
        data-testid="hero-signup-cta"
        onClick={handleSignupClick}
        className="inline-flex mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        {heroCopy.ctaLabel}
      </a>
    </section>
  )
}
