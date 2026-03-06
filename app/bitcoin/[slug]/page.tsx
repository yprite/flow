import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LandingHeroCopyExperiment from '@/components/landing-hero-copy-experiment'
import RecommendedQuestionsExperiment from '@/components/recommended-questions-experiment'
import { PERFORMANCE_GUARDRAILS } from '@/lib/performance-guardrails'
import { getSeoIntentBySlug, SEO_INTENT_PAGES } from '@/lib/seo-intents'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SEO_INTENT_PAGES.map((intentPage) => ({ slug: intentPage.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const intentPage = getSeoIntentBySlug(slug)

  if (!intentPage) {
    return {
      title: 'Not Found',
      description: 'Requested Bitcoin on-chain landing page does not exist.',
    }
  }

  return {
    title: `${intentPage.title} | Bitcoin On-Chain Data`,
    description: intentPage.description,
    keywords: [intentPage.primaryKeyword, ...intentPage.keywordCluster],
    alternates: {
      canonical: `/bitcoin/${intentPage.slug}`,
    },
    openGraph: {
      title: intentPage.title,
      description: intentPage.description,
      type: 'article',
      url: `/bitcoin/${intentPage.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: intentPage.title,
      description: intentPage.description,
    },
  }
}

export default async function BitcoinIntentLandingPage({ params }: PageProps) {
  const { slug } = await params
  const intentPage = getSeoIntentBySlug(slug)

  if (!intentPage) {
    notFound()
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: intentPage.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <LandingHeroCopyExperiment
          slug={intentPage.slug}
          defaultTitle={intentPage.title}
          defaultDescription={intentPage.description}
        />

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Key Use Cases</h2>
          <ul className="space-y-2 text-slate-700">
            {intentPage.useCases.map((useCase) => (
              <li key={useCase} className="flex gap-2">
                <span className="text-indigo-500">•</span>
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </section>

        <RecommendedQuestionsExperiment
          slug={intentPage.slug}
          recommendedQuestions={intentPage.recommendedQuestions}
        />

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Keyword Coverage</h2>
          <div className="flex flex-wrap gap-2">
            {[intentPage.primaryKeyword, ...intentPage.keywordCluster].map((keyword) => (
              <span key={keyword} className="text-sm rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {keyword}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Performance Guardrails</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERFORMANCE_GUARDRAILS.map((guardrail) => (
              <div key={guardrail.metric} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">{guardrail.metric}</p>
                <p className="text-indigo-700 font-bold mt-1">{guardrail.target}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">FAQ</h2>
          <div className="space-y-4">
            {intentPage.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-sm font-semibold text-slate-800">{faq.question}</h3>
                <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex gap-4 text-sm">
          <Link href="/bitcoin" className="text-indigo-700 hover:text-indigo-900 font-medium">
            ← Back to intent index
          </Link>
          <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">
            Dashboard home
          </Link>
        </div>
      </div>
    </main>
  )
}
