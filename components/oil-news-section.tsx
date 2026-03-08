'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { trackEvent } from '@/lib/analytics-client'

interface NewsItem {
  title: string
  link: string
  date: string
  source: string
}

function relativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
  } catch {
    return ''
  }
}

export function OilNewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setNews(items)
        }
      })
      .catch(() => {})
  }, [])

  if (news.length === 0) return null

  const tickerText = news.map((item) => `${item.title} (${item.source})`).join(' :: ')

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/8 bg-slate-950/70 shadow-2xl shadow-slate-950/40">
      <div className="flex items-center border-b border-rose-900/40 bg-rose-950/50">
        <div className="flex shrink-0 items-center gap-1 border-r border-rose-800/50 bg-rose-900/80 px-3 py-2">
          <Newspaper className="h-3.5 w-3.5 text-rose-300" />
          <span className="text-xs font-bold text-rose-200">유가 뉴스</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="shrink-0 px-4 py-2 text-sm text-rose-300">
              {'\uD83D\uDEA8'} {tickerText} &nbsp;&nbsp;&nbsp;
            </span>
            <span className="shrink-0 px-4 py-2 text-sm text-rose-300">
              {'\uD83D\uDEA8'} {tickerText} &nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200/80">
              Oil Watch
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              오늘 유가와 국제 이슈를 같이 봅니다
            </h2>
          </div>
          <p className="max-w-sm text-right text-sm leading-6 text-slate-400">
            가격 비교 전에 지금 시장이 왜 흔들리는지 빠르게 읽을 수 있도록 루트에
            배치했습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {news.slice(0, 6).map((item, index) => (
            <a
              key={`${item.link}-${index}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('news_click', '/', {
                  title: item.title,
                  source: item.source,
                  rank: index + 1,
                })
              }
              className="group rounded-2xl border border-white/8 bg-white/5 p-4 transition-colors hover:border-rose-400/40 hover:bg-white/8"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-rose-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-6 text-slate-100 transition-colors group-hover:text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {item.source}
                    {item.date && ` · ${relativeTime(item.date)}`}
                  </p>
                </div>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-rose-300" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
