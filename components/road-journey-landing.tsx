'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValueEvent } from 'framer-motion'
import { Fuel, BatteryCharging } from 'lucide-react'
import { HomeQuickActions } from '@/components/home-quick-actions'
import { OilNewsSection } from '@/components/oil-news-section'
import { AdsenseSlot } from '@/components/adsense-slot'
import { PageViewTracker } from '@/components/page-view-tracker'
import { ServiceShareButton } from '@/components/service-share-button'
import { SiteFooter } from '@/components/site-footer'
import { SEO_REGIONS } from '@/lib/regions'
import { GUIDES } from '@/lib/guides'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

// ─── Road scenery items ─────────────────────────────────────────
const SCENERY_ITEMS = [
  { emoji: '\u{1F332}', top: 8, side: 'left' as const, size: 'text-2xl', speed: 0.3 },
  { emoji: '\u{1F333}', top: 12, side: 'right' as const, size: 'text-xl', speed: 0.25 },
  { emoji: '\u{1F3E2}', top: 20, side: 'left' as const, size: 'text-lg', speed: 0.2 },
  { emoji: '\u{26FD}', top: 28, side: 'right' as const, size: 'text-2xl', speed: 0.35 },
  { emoji: '\u{1F332}', top: 35, side: 'right' as const, size: 'text-xl', speed: 0.28 },
  { emoji: '\u{1F3EA}', top: 42, side: 'left' as const, size: 'text-lg', speed: 0.22 },
  { emoji: '\u{1F333}', top: 50, side: 'left' as const, size: 'text-2xl', speed: 0.3 },
  { emoji: '\u{1F50B}', top: 55, side: 'right' as const, size: 'text-xl', speed: 0.32 },
  { emoji: '\u{1F332}', top: 62, side: 'right' as const, size: 'text-lg', speed: 0.25 },
  { emoji: '\u{1F3E0}', top: 68, side: 'left' as const, size: 'text-xl', speed: 0.2 },
  { emoji: '\u{26FD}', top: 75, side: 'left' as const, size: 'text-2xl', speed: 0.35 },
  { emoji: '\u{1F333}', top: 82, side: 'right' as const, size: 'text-xl', speed: 0.28 },
  { emoji: '\u{1F3E2}', top: 88, side: 'left' as const, size: 'text-lg', speed: 0.22 },
  { emoji: '\u{1F332}', top: 94, side: 'right' as const, size: 'text-2xl', speed: 0.3 },
]

// ─── Scenery item with parallax ─────────────────────────────────
function SceneryItem({
  emoji,
  top,
  side,
  size,
  speed,
  scrollYProgress,
}: {
  emoji: string
  top: number
  side: 'left' | 'right'
  size: string
  speed: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 600])

  return (
    <motion.div
      className={`pointer-events-none absolute ${size} opacity-20`}
      style={{
        top: `${top}%`,
        [side]: side === 'left' ? '4px' : '4px',
        y,
      }}
    >
      {emoji}
    </motion.div>
  )
}

// ─── Sticky driving car + distance HUD ──────────────────────────
function DistanceDisplay({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [km, setKm] = useState(0)

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    setKm(Math.round(v * 482) / 10)
  })

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:bottom-8">
      <div className="flex flex-col items-center">
        {/* Headlight glow */}
        <motion.div
          className="absolute -top-6 h-12 w-6 rounded-full bg-amber-300/30 blur-xl"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        {/* Car with wobble */}
        <motion.span
          className="relative text-4xl drop-shadow-[0_0_16px_rgba(251,191,36,0.5)] md:text-5xl"
          animate={{
            rotate: [-1.5, 1.5, -1.5],
            y: [-1, 1, -1],
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        >
          {'\u{1F697}'}
        </motion.span>
        {/* Speed lines under car */}
        <div className="mt-0.5 flex gap-0.5">
          {[0, 0.15, 0.3].map((delay) => (
            <motion.div
              key={delay}
              className="h-3 w-0.5 rounded-full bg-amber-400/50"
              animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.5, delay }}
            />
          ))}
        </div>
        {/* Distance badge */}
        <div className="mt-1.5 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-slate-950/90 px-3 py-1 backdrop-blur">
          <div className="h-1.5 w-1.5 animate-glow rounded-full bg-emerald-400" />
          <span className="font-mono text-xs font-bold text-amber-200">
            {km.toFixed(1)}
            <span className="ml-0.5 text-amber-400/70">km</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Scroll-linked center dashes ────────────────────────────────
function RoadCenterLine({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const dashOffset = useTransform(scrollYProgress, [0, 1], [0, 2000])

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 opacity-25"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(251,191,36,0.7) 0px, rgba(251,191,36,0.7) 20px, transparent 20px, transparent 40px)',
        backgroundSize: '2px 40px',
        backgroundPositionY: dashOffset,
      }}
    />
  )
}

// ─── Road edge with glow ────────────────────────────────────────
function RoadEdge({ side }: { side: 'left' | 'right' }) {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-y-0 ${side === 'left' ? 'left-0 md:left-2' : 'right-0 md:right-2'} w-px bg-gradient-to-b from-transparent via-amber-500/25 to-transparent`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 ${side === 'left' ? 'left-0 md:left-2' : 'right-0 md:right-2'} w-4 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent ${side === 'left' ? '' : '-translate-x-3'}`}
      />
    </>
  )
}

// ─── Checkpoint wrapper ─────────────────────────────────────────
function RoadCheckpoint({
  number,
  label,
  children,
}: {
  number: string
  label: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative"
    >
      {/* checkpoint bar */}
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <motion.div
          className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/80 px-4 py-2 text-sm font-bold text-amber-200 backdrop-blur"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-base">{'\u{1F6A9}'}</span>
          <span className="uppercase tracking-widest">Checkpoint {number}</span>
          <span className="text-amber-400">{label}</span>
        </motion.div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      </div>

      {children}
    </motion.section>
  )
}

// ─── Road segment between checkpoints ───────────────────────────
function RoadSegment() {
  return (
    <div className="relative my-16 flex items-center justify-center">
      {/* road markers */}
      <div className="absolute left-1/2 h-full w-px -translate-x-1/2 border-l border-dashed border-amber-500/20" />
      <div className="flex items-center gap-3 opacity-30">
        <div className="h-px w-12 bg-amber-500/30" />
        <span className="text-xs text-amber-400">{'\u{25B8}'}{'\u{25B8}'}{'\u{25B8}'}</span>
        <div className="h-px w-12 bg-amber-500/30" />
      </div>
    </div>
  )
}

// ─── Finish line ────────────────────────────────────────────────
function FinishLine() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="relative z-10 mb-8 flex items-center gap-3"
    >
      <div
        className="h-2 flex-1 rounded-full"
        style={{
          background:
            'repeating-linear-gradient(90deg, white 0px, white 10px, transparent 10px, transparent 20px)',
        }}
      />
      <motion.div
        className="rounded-full bg-white px-6 py-3 text-lg font-black text-slate-900 shadow-lg shadow-white/20"
        animate={isInView ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        {'\u{1F3C1}'} &#xB3C4;&#xCC29;
      </motion.div>
      <div
        className="h-2 flex-1 rounded-full"
        style={{
          background:
            'repeating-linear-gradient(90deg, transparent 0px, transparent 10px, white 10px, white 20px)',
        }}
      />
    </motion.div>
  )
}

// ─── Main component ─────────────────────────────────────────────
interface RoadJourneyLandingProps {
  homeInlineAdSlot: string | null
  faqItems: Array<{ question: string; answer: string }>
}

export function RoadJourneyLanding({
  homeInlineAdSlot,
  faqItems,
}: RoadJourneyLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.22),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#020617,_#0f172a_60%,_#111827)] text-white"
    >
      <PageViewTracker path="/" metadata={{ pageType: 'landing' }} />

      {/* Sticky driving car + HUD */}
      <DistanceDisplay scrollYProgress={scrollYProgress} />

      {/* Road container */}
      <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-10 md:px-6 md:pb-32 md:pt-16">
        {/* Road edges with glow */}
        <RoadEdge side="left" />
        <RoadEdge side="right" />

        {/* Scroll-linked center dashed line */}
        <RoadCenterLine scrollYProgress={scrollYProgress} />

        {/* Parallax road scenery */}
        {SCENERY_ITEMS.map((item, i) => (
          <SceneryItem key={i} {...item} scrollYProgress={scrollYProgress} />
        ))}

        {/* ─── HERO ──────────────────────────────────────────── */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex flex-col items-center gap-8 pb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
            {SITE_TAGLINE}
          </div>

          <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            &#xCD9C;&#xBC1C;&#xD569;&#xB2C8;&#xB2E4;.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-emerald-300 bg-clip-text text-transparent">
              &#xC5B4;&#xB514;&#xB85C; &#xCC44;&#xC6B8;&#xAE4C;&#xC694;?
            </span>
          </h1>

          <p className="max-w-lg text-lg leading-8 text-slate-300">
            {SITE_NAME}&#xB294; &#xB0B4; &#xC8FC;&#xBCC0; &#xCD5C;&#xC800;&#xAC00; &#xC8FC;&#xC720;&#xC18C;&#xC640; &#xC804;&#xAD6D; &#xD3C9;&#xADE0; &#xC720;&#xAC00;&#xB97C; &#xBE60;&#xB974;&#xAC8C; &#xBE44;&#xAD50;&#xD558;&#xB294; &#xAC80;&#xC0C9; &#xC11C;&#xBE44;&#xC2A4;&#xC785;&#xB2C8;&#xB2E4;.
          </p>

          {/* Two destination buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/gas-finder"
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/25 transition-transform hover:-translate-y-1"
            >
              <Fuel className="h-6 w-6" />
              &#xC8FC;&#xC720;&#xC18C; &#xCC3E;&#xAE30;
            </Link>
            <Link
              href="/ev-finder"
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-1"
            >
              <BatteryCharging className="h-6 w-6" />
              &#xCDA9;&#xC804;&#xC18C; &#xCC3E;&#xAE30;
            </Link>
          </div>

          <ServiceShareButton path="/" eventPath="/" />

          {/* Road start marker */}
          <div className="relative mt-4 flex w-full flex-col items-center gap-3">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <motion.div
              className="flex items-center gap-2 text-sm font-semibold text-amber-300/60"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span>{'\u{25BC}'}</span>
              <span>&#xC2A4;&#xD06C;&#xB864;&#xD574;&#xC11C; &#xCD9C;&#xBC1C;&#xD558;&#xC138;&#xC694;</span>
              <span>{'\u{25BC}'}</span>
            </motion.div>
          </div>
        </motion.div>

        <RoadSegment />

        {/* ─── CHECKPOINT 1: Quick Start ──────────────────── */}
        <RoadCheckpoint number="1" label="&#xBE60;&#xB978; &#xCD9C;&#xBC1C;">
          <HomeQuickActions />
        </RoadCheckpoint>

        <RoadSegment />

        {/* ─── CHECKPOINT 2: Oil News ─────────────────────── */}
        <RoadCheckpoint number="2" label="&#xC624;&#xB298;&#xC758; &#xC720;&#xAC00;">
          <OilNewsSection />
        </RoadCheckpoint>

        <RoadSegment />

        {/* ─── CHECKPOINT 3: Region Select ────────────────── */}
        <RoadCheckpoint number="3" label="&#xC9C0;&#xC5ED; &#xC120;&#xD0DD;">
          <div className="rounded-[32px] border border-white/8 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                  Region Routes
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  &#xC5B4;&#xB290; &#xB3C4;&#xC2DC;&#xB85C; &#xD5A5;&#xD558;&#xC2DC;&#xB098;&#xC694;?
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  &#xC8FC;&#xC694; &#xB3C4;&#xC2DC;&#xBCC4; &#xAC80;&#xC0C9; &#xD654;&#xBA74;&#xC73C;&#xB85C; &#xBC14;&#xB85C; &#xC774;&#xB3D9;&#xD569;&#xB2C8;&#xB2E4;.
                </p>
              </div>
              <Link
                href="/gas-finder"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white"
              >
                &#xC804;&#xCCB4; &#xAC80;&#xC0C9; &#xD654;&#xBA74; &#xC5F4;&#xAE30;
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {SEO_REGIONS.map((region) => (
                <Link
                  key={region.slug}
                  href={`/regions/${region.slug}`}
                  className="group rounded-2xl border-2 border-white/20 bg-emerald-950/60 p-5 transition-all hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-emerald-900/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{'\u{1F6E3}\u{FE0F}'}</span>
                    <span className="text-sm font-semibold text-emerald-300">{region.fullName}</span>
                  </div>
                  <div className="mt-2 text-2xl font-black">{region.name} &#xAE30;&#xB984;&#xAC12;</div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{region.summary}</p>
                  <div className="mt-4 text-xs text-slate-500">
                    {region.popularAreas.join(' \u00B7 ')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </RoadCheckpoint>

        <RoadSegment />

        {/* ─── CHECKPOINT 4: Driver Guides ────────────────── */}
        <RoadCheckpoint number="4" label="&#xC6B4;&#xC804;&#xC790; &#xAC00;&#xC774;&#xB4DC;">
          <div className="rounded-[32px] border border-white/8 bg-slate-950/70 p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                  Driver Guides
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  &#xB3C4;&#xCC29; &#xC804;&#xC5D0; &#xC77D;&#xC5B4;&#xB450;&#xBA74; &#xB354; &#xC544;&#xB084; &#xC218; &#xC788;&#xC2B5;&#xB2C8;&#xB2E4;
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  &#xD3C9;&#xADE0; &#xC720;&#xAC00; &#xD574;&#xC11D;, &#xC7A5;&#xAC70;&#xB9AC; &#xC8FC;&#xC720; &#xB8E8;&#xD2F4;, &#xC54C;&#xB730;&#xC8FC;&#xC720;&#xC18C; &#xBE44;&#xAD50;&#xCC98;&#xB7FC; &#xC2E4;&#xC81C; &#xC6B4;&#xC804;&#xC790; &#xC758;&#xC0AC;&#xACB0;&#xC815;&#xC5D0; &#xD544;&#xC694;&#xD55C; &#xAC00;&#xC774;&#xB4DC;&#xB97C; &#xC815;&#xB9AC;&#xD588;&#xC2B5;&#xB2C8;&#xB2E4;.
                </p>
              </div>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-white"
              >
                &#xC804;&#xCCB4; &#xAC00;&#xC774;&#xB4DC; &#xBCF4;&#xAE30;
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {GUIDES.slice(0, 3).map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="rounded-2xl border border-white/8 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:border-emerald-400/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                    {guide.category}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight">{guide.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{guide.description}</p>
                  <div className="mt-5 text-sm font-semibold text-emerald-200">
                    {guide.readingTime} &#xC77D;&#xAE30;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </RoadCheckpoint>

        <RoadSegment />

        <AdsenseSlot slot={homeInlineAdSlot} />

        <RoadSegment />

        {/* ─── FINISH: FAQ ────────────────────────────────── */}
        <FinishLine />

        <section className="relative z-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
              Why It Works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              &#xC8FC;&#xC720; &#xC804;&#xC5D0; &#xD544;&#xC694;&#xD55C; &#xC815;&#xBCF4;&#xB9CC; &#xB0A8;&#xACBC;&#xC2B5;&#xB2C8;&#xB2E4;.
            </h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <p>&#xAC00;&#xACA9;&#xC21C;&#xACFC; &#xAC70;&#xB9AC;&#xC21C;&#xC744; &#xD568;&#xAED8; &#xC81C;&#xACF5;&#xD574;&#xC11C;, &#xC2FC; &#xACF3;&#xC744; &#xCC3E;&#xB2E4;&#xAC00; &#xC624;&#xD788;&#xB824; &#xB354; &#xBA40;&#xB9AC; &#xAC00;&#xC9C0; &#xC54A;&#xAC8C; &#xD569;&#xB2C8;&#xB2E4;.</p>
              <p>&#xBE0C;&#xB79C;&#xB4DC; &#xD544;&#xD130;&#xC640; &#xC804;&#xAD6D; &#xD3C9;&#xADE0; &#xC720;&#xAC00;&#xB97C; &#xD568;&#xAED8; &#xBCF4;&#xC5EC;&#xC918;&#xC11C; &#xCCB4;&#xAC10; &#xAC00;&#xACA9;&#xC774; &#xBE44;&#xC2FC;&#xC9C0; &#xBC14;&#xB85C; &#xD310;&#xB2E8;&#xD560; &#xC218; &#xC788;&#xC2B5;&#xB2C8;&#xB2E4;.</p>
              <p>&#xACB0;&#xACFC; &#xD654;&#xBA74;&#xC5D0;&#xC11C; &#xBC14;&#xB85C; &#xC9C0;&#xB3C4; &#xC571;&#xC73C;&#xB85C; &#xC774;&#xB3D9;&#xD558;&#xBBC0;&#xB85C; &#xAC80;&#xC0C9;&#xC5D0;&#xC11C; &#xD589;&#xB3D9;&#xAE4C;&#xC9C0;&#xC758; &#xB9C8;&#xCC30;&#xC774; &#xC791;&#xC2B5;&#xB2C8;&#xB2E4;.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200/80">
              FAQ
            </p>
            <div className="mt-4 space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-white/8 bg-white/5 p-5">
                  <h3 className="text-lg font-bold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12">
          <SiteFooter />
        </div>
      </div>
    </main>
  )
}
