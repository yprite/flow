import type { Metadata } from 'next'
import Link from 'next/link'
import { PERFORMANCE_GUARDRAILS } from '@/lib/performance-guardrails'
import { SEO_INTENT_PAGES } from '@/lib/seo-intents'

export const metadata: Metadata = {
  title: 'Bitcoin On-Chain Query Guides',
  description: 'Indexable intent pages for Bitcoin on-chain analysis: address lookup, fee estimator, mempool tracking, and whale alerts.',
  alternates: {
    canonical: '/bitcoin',
  },
}

export default function BitcoinIntentIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
            SEO Foundation
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Bitcoin On-Chain Intent Pages
          </h1>
          <p className="text-slate-600 mt-3 max-w-3xl">
            Core landing pages mapped to high-intent Bitcoin on-chain queries.
            Each page has dedicated metadata, structured content, and internal links
            to improve organic acquisition quality.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {SEO_INTENT_PAGES.map((intentPage) => (
            <article key={intentPage.slug} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-2">
                {intentPage.primaryKeyword}
              </p>
              <h2 className="text-xl font-semibold text-slate-900">{intentPage.title}</h2>
              <p className="text-slate-600 mt-2 text-sm">{intentPage.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intentPage.keywordCluster.slice(0, 3).map((keyword) => (
                  <span key={keyword} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
              <Link
                href={`/bitcoin/${intentPage.slug}`}
                className="inline-flex mt-4 text-sm font-medium text-indigo-700 hover:text-indigo-900"
              >
                Open landing page →
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Performance Guardrails</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERFORMANCE_GUARDRAILS.map((guardrail) => (
              <div key={guardrail.metric} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-800">{guardrail.metric}</p>
                <p className="text-lg font-bold text-indigo-700 mt-1">{guardrail.target}</p>
                <p className="text-xs text-slate-600 mt-2">{guardrail.rationale}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
