import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'

export function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#020617,_#111827_55%,_#1e293b)] text-white">
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            홈
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{title}</span>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/8 bg-white/5 p-6 backdrop-blur md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
        </div>

        <div className="mt-8 space-y-6">{children}</div>

        <SiteFooter className="mt-12" />
      </section>
    </main>
  )
}
