'use client'

import { motion } from 'framer-motion'
import { BarChart3, DollarSign, GitCompareArrows, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

export function StatsSection({ phones }: { phones: Phone[] }) {
  const { dict } = useLanguage()

  // The count is derived from the real catalog (not a hardcoded number).
  // Colors now read from the shared design tokens (bg-accent, bg-primary,
  // bg-success, bg-warning) instead of hardcoded Tailwind palette classes —
  // they follow light/dark automatically, no per-component dark: needed.
  const STATS = [
    {
      icon: BarChart3,
      color: 'bg-accent/10 text-accent',
      value: `${phones.length}+`,
      label: dict.statsSection.phonesLabel,
      hint: dict.statsSection.phonesHint,
    },
    {
      icon: GitCompareArrows,
      color: 'bg-primary/10 text-primary',
      value: dict.statsSection.compareValue,
      label: dict.statsSection.compareLabel,
      hint: dict.statsSection.compareHint,
    },
    {
      icon: DollarSign,
      color: 'bg-success/10 text-success',
      value: dict.statsSection.filtersValue,
      label: dict.statsSection.filtersLabel,
      hint: dict.statsSection.filtersHint,
    },
    {
      icon: Sparkles,
      color: 'bg-warning/10 text-warning',
      value: 'ABDOU',
      label: 'SCORE',
      hint: dict.statsSection.scoreHint,
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-elevation-sm"
          >
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${stat.color}`}>
              <stat.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{stat.hint}</p>
              <p className="text-xs text-muted-foreground">
                {stat.value} {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}