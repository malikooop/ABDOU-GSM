'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { AbdouScore } from '@/components/abdou-score'
import { CategoryBadge } from '@/components/category-badge'
import { PhoneImage } from '@/components/phone-image'
import { RatingBar } from '@/components/rating-bar'
import { CompareToggleButton } from '@/components/compare-toggle-button'
import { formatDZD } from '@/lib/format'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

const SPEC_KEYS = [
  'display',
  'chipset',
  'ram',
  'storage',
  'battery',
  'mainCamera',
  'os',
  'releaseYear',
] as const

export function PhoneDetailsView({ phone }: { phone: Phone }) {
  const { dict } = useLanguage()

  const ratingEntries = Object.entries(phone.ratings ?? {}).filter(
    ([, v]) => typeof v === 'number',
  ) as [keyof typeof dict.phoneDetails.ratingLabels, number][]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid max-w-5xl gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:gap-14"
    >
      {/* Visual + primary info — no bordered card, plain surfaces */}
      <div>
        <div className="flex items-center justify-between">
          <CategoryBadge category={phone.category} />
          <AbdouScore score={phone.score} size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative my-6 h-64 rounded-3xl bg-secondary/30"
        >
          <PhoneImage phone={phone} className="p-8" />
        </motion.div>

        <div>
          <p className="text-sm text-muted-foreground">{phone.brand}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {phone.model}
          </h1>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {formatDZD(phone.price)}
          </p>
          {/* phone.highlight is always Arabic content regardless of UI
              language (product-content stays Arabic-only decision) —
              explicit dir="rtl" keeps it correct in English/LTR mode. */}
          <p dir="rtl" className="mt-3 text-pretty text-end text-sm leading-relaxed text-muted-foreground">
            {phone.highlight}
          </p>
        </div>

        <div className="mt-6">
          <CompareToggleButton phone={phone} />
        </div>

        {ratingEntries.length > 0 && (
          <div className="mt-8 border-t border-border/60 pt-6">
            <h2 className="mb-5 font-display text-lg font-semibold text-foreground">
              {dict.phoneDetails.ratingBreakdown}
            </h2>
            <div className="space-y-5">
              {ratingEntries.map(([key, value]) => (
                <RatingBar key={key} label={dict.phoneDetails.ratingLabels[key] ?? key} value={value} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Specs + strengths/weaknesses — sections separated by plain
          dividers instead of stacked bordered cards */}
      <div className="space-y-8">
        <div>
          <h2 className="mb-5 font-display text-lg font-semibold text-foreground">
            {dict.phoneDetails.fullSpecs}
          </h2>
          <dl className="divide-y divide-border/60">
            {SPEC_KEYS.map((key, i) => {
              const value = phone.specs?.[key]
              if (!value) return null
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 text-sm transition-colors duration-200 hover:bg-secondary/40"
                >
                  <dt className="text-muted-foreground">{dict.phoneDetails.specLabels[key]}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </motion.div>
              )
            })}
          </dl>
        </div>

        {phone.strengths && phone.strengths.length > 0 && (
          <div className="border-t border-border/60 pt-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              {dict.phoneDetails.strengths}
            </h2>
            <ul className="space-y-2.5">
              {phone.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span dir="rtl" className="text-pretty text-end">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {phone.weaknesses && phone.weaknesses.length > 0 && (
          <div className="border-t border-border/60 pt-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              {dict.phoneDetails.weaknesses}
            </h2>
            <ul className="space-y-2.5">
              {phone.weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span dir="rtl" className="text-pretty text-end">
                    {w}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}