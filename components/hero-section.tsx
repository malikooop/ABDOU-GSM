'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, RefreshCcw, ShieldCheck, Smartphone, Star } from 'lucide-react'
import { AbdouScore } from '@/components/abdou-score'
import { PhoneImage } from '@/components/phone-image'
import { formatDZD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

export function HeroSection({ phones }: { phones: Phone[] }) {
  const { dict } = useLanguage()
  const [primary, ...rest] = phones
  const secondary = rest.slice(0, 2)

  const brandCount = new Set(phones.map((p) => p.brand)).size

  const features = [
    { icon: Smartphone, text: `${phones.length}+ ${dict.hero.featureSupported}` },
    { icon: ShieldCheck, text: dict.hero.featureAccuracy },
    { icon: RefreshCcw, text: dict.hero.featureUpdate },
  ]

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
      </div>

      <div
        className={cn(
          'mx-auto grid max-w-7xl items-center gap-7 px-4 py-10 sm:px-6 md:py-14',
          primary ? 'lg:grid-cols-[1.05fr_1fr]' : 'lg:grid-cols-1',
        )}
      >
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center lg:text-start"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-sm font-semibold text-muted-foreground shadow-elevation-sm backdrop-blur-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" aria-hidden="true" />
            {dict.hero.badge}
          </span>

          <h1 className="mt-4 text-balance font-display text-5xl font-bold leading-[1.15] text-foreground sm:text-6xl lg:text-7xl">
            {dict.hero.title}
          </h1>

          <div className="mx-auto mt-5 max-w-xl space-y-1.5 lg:mx-0">
            <p className="text-lg leading-relaxed text-muted-foreground">{dict.hero.description}</p>
            <p className="text-sm leading-relaxed text-muted-foreground/80">{dict.hero.description2}</p>
            <p className="text-sm leading-relaxed text-muted-foreground/80">{dict.hero.description3}</p>
          </div>

          {/* Real stats + one qualitative capability badge ("AI") — the
              first two are counted from the live catalog, the third
              describes a real, working feature (the AI compare button
              below), not a fabricated number. */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
            <div>
              <p className="text-3xl font-bold text-primary">{phones.length}+</p>
              <p className="text-sm text-muted-foreground">{dict.hero.statsPhones}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-3xl font-bold text-primary">{brandCount}+</p>
              <p className="text-sm text-muted-foreground">{dict.hero.statsBrands}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-3xl font-bold text-primary">AI</p>
              <p className="text-sm text-muted-foreground">{dict.hero.statsCompare}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/phones"
              className="gradient-primary glow-primary inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_color-mix(in_srgb,var(--primary)_55%,transparent)] active:scale-[0.98]"
            >
              <Smartphone className="size-4" aria-hidden="true" />
              {dict.hero.exploreCta}
            </Link>

            <Link
              href="/compare"
              className="inline-flex h-12 items-center gap-1.5 rounded-full border border-border bg-card px-7 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
            >
              {dict.hero.aiCta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {features.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <f.icon className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product visual */}
        {primary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-sm lg:max-w-none"
          >
            <div className="relative">
              <div className="relative mx-auto h-[400px] w-full max-w-[22rem] lg:h-[500px]">
                {/* Breathing core glow — sits behind everything, gives the
                    whole cluster a powered-on feel instead of a static blob. */}
                <div className="animate-pulse-glow absolute left-1/2 top-1/2 -z-10 h-[68%] w-[68%] rounded-full bg-primary/25 blur-[90px]" />

                {/* Static reference ring, closest to the device. */}
                <div className="absolute left-1/2 top-1/2 -z-10 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 dark:border-white/10" />

                {/* Two counter-rotating orbit tracks — a real ring (masked
                    to a thin band) rather than a filled glowing disc, so it
                    reads as an active orbit around the device. */}
                <div className="orbit-track absolute left-1/2 top-1/2 -z-10 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 dark:opacity-90" />
                <div className="orbit-track orbit-track-reverse absolute left-1/2 top-1/2 -z-10 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 dark:opacity-40" />

                {/* Satellite particles travelling the outer orbit — two
                    dots, opposite directions and speeds, so the motion never
                    reads as perfectly synchronized/mechanical. */}
                <div className="orbit-satellite absolute left-1/2 top-1/2 -z-10 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_3px_var(--primary)]" />
                </div>
                <div className="orbit-satellite-reverse absolute left-1/2 top-1/2 -z-10 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_3px_var(--accent)]" />
                </div>

                <PhoneImage phone={primary} priority className="transition-transform duration-500 hover:-translate-y-1" />

                <div className="glass-panel animate-float absolute -start-4 top-14 hidden rounded-2xl px-5 py-4 shadow-elevation-md lg:block">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">RAM</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{primary.specs?.ram ?? '—'}</p>
                </div>

                <div className="glass-panel animate-float-delayed absolute -end-4 bottom-14 hidden rounded-2xl px-5 py-4 shadow-elevation-md lg:block">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">STORAGE</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{primary.specs?.storage ?? '—'}</p>
                </div>
              </div>

              <div className="glass-panel animate-float-slow absolute end-0 top-2 rounded-2xl px-5 py-4 shadow-elevation-md">
                <div className="flex items-center gap-2">
                  <AbdouScore score={primary.score} size="sm" glow />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      ABDOU SCORE
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-foreground">
                      {primary.brand} {primary.model}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center font-display text-2xl font-bold text-primary lg:text-start">
                {formatDZD(primary.price)}
              </p>
            </div>

            {secondary.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {secondary.map((phone) => {
                  const specLine = [phone.specs?.ram, phone.specs?.storage].filter(Boolean).join(' • ')
                  return (
                    <Link
                      key={phone.id}
                      href={`/phone/${phone.id}`}
                      className="group rounded-2xl border border-border bg-card p-5 text-center shadow-elevation-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-elevation-md"
                    >
                      <div className="relative mx-auto h-24 w-24 transition-transform duration-300 group-hover:scale-105">
                        <PhoneImage phone={phone} />
                      </div>
                      <p className="mt-4 truncate text-sm font-bold text-foreground">{phone.model}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{phone.brand}</p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-primary">
                        <Star className="size-3.5 fill-current" aria-hidden="true" />
                        {Number.isFinite(phone.score) ? phone.score.toFixed(1) : '—'}
                      </div>
                      {specLine && <p className="mt-1 text-xs text-muted-foreground">{specLine}</p>}
                    </Link>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}