'use client'

import { motion } from 'framer-motion'
import { BarChart3, Cpu, ShieldCheck, Trophy } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-provider'

const ICONS = [Trophy, Cpu, BarChart3, ShieldCheck] as const

const COLORS = [
  'bg-warning/10 text-warning',
  'bg-primary/10 text-primary',
  'bg-success/10 text-success',
  'bg-accent/10 text-accent',
]

export function FeaturesSection() {
  const { dict } = useLanguage()
  const items = dict.featuresSection.items

  return (
    <section className="py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i] ?? Trophy

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-elevation-sm transition-all transition-premium hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-md"
            >
              <div className="absolute inset-x-0 top-0 h-px gradient-primary opacity-70" />

              <span
                className={`grid size-14 place-items-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${COLORS[i]}`}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>

              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}