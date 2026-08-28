'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, GitCompareArrows, Loader2, X } from 'lucide-react'
import { AbdouScore } from '@/components/abdou-score'
import { CategoryBadge } from '@/components/category-badge'
import { PhoneImage } from '@/components/phone-image'
import { formatDZD } from '@/lib/format'
import { comparePhones } from '@/lib/api'
import { MAX_COMPARE, useCompareSelection } from '@/lib/compare-store'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

const SPEC_KEYS: (keyof NonNullable<Phone['specs']>)[] = [
  'display',
  'chipset',
  'ram',
  'storage',
  'battery',
  'mainCamera',
  'os',
  'releaseYear',
]

function parseIds(raw: string | null): number[] {
  if (!raw) return []
  return Array.from(
    new Set(
      raw.split(',').map((v) => Number(v.trim())).filter((v) => Number.isFinite(v) && v > 0),
    ),
  ).slice(0, MAX_COMPARE)
}

export function ComparePageClient() {
  const searchParams = useSearchParams()
  const { remove } = useCompareSelection()
  const { dict } = useLanguage()

  const ids = parseIds(searchParams.get('ids'))

  const [phones, setPhones] = useState<Phone[]>([])
  const [loading, setLoading] = useState(ids.length >= 2)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ids.length < 2) {
      setPhones([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    comparePhones(ids)
      .then((result) => {
        if (cancelled) return
        setPhones(result)
        if (result.length < 2) {
          setError(dict.comparePage.notEnoughDataError)
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('comparePhones failed:', err)
        setError(dict.comparePage.loadFailedError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  if (ids.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-elevation-sm"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <GitCompareArrows className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            {dict.comparePage.notEnoughSelectedTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
            {dict.comparePage.notEnoughSelectedDescription}
          </p>
        </div>
        <Link
          href="/phones"
          className="gradient-primary mt-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {dict.comparePage.browsePhones}
        </Link>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{dict.comparePage.loadingComparison}</p>
      </div>
    )
  }

  if (error && phones.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-card py-16 text-center"
      >
        <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link
          href="/phones"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
        >
          {dict.phoneDetails.backToPhones}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="overflow-x-auto"
    >
      <div
        role="table"
        aria-label={dict.comparePage.tableAriaLabel}
        className="grid min-w-[640px] gap-x-4"
        style={{ gridTemplateColumns: `140px repeat(${phones.length}, minmax(180px, 1fr))` }}
      >
        <div role="row" className="contents">
          <div role="columnheader" />
          <AnimatePresence>
            {phones.map((phone, i) => (
              <motion.div
                key={phone.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                role="columnheader"
                className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 pb-6 text-center shadow-elevation-sm"
              >
                <button
                  type="button"
                  aria-label={dict.comparePage.removeFromComparison.replace('{model}', phone.model)}
                  onClick={() => remove(phone.id)}
                  className="absolute end-2 top-2 rounded-lg p-1 text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
                <div className="relative h-28 w-full">
                  <PhoneImage phone={phone} />
                </div>
                <CategoryBadge category={phone.category} />
                <Link href={`/phone/${phone.id}`} className="font-display text-sm font-bold text-foreground hover:text-primary">
                  {phone.model}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div role="row" className="contents">
          <div role="rowheader" className="flex items-center border-t border-border/60 py-3 text-sm font-medium text-muted-foreground">
            ABDOU SCORE
          </div>
          {phones.map((phone) => (
            <div key={phone.id} role="cell" className="flex items-center justify-center border-t border-border/60 py-3">
              <AbdouScore score={phone.score} size="md" />
            </div>
          ))}
        </div>

        <div role="row" className="contents">
          <div role="rowheader" className="flex items-center border-t border-border/60 py-3 text-sm font-medium text-muted-foreground">
            {dict.comparePage.priceLabel}
          </div>
          {phones.map((phone) => (
            <div key={phone.id} role="cell" className="flex items-center justify-center border-t border-border/60 py-3 font-display text-base font-bold text-primary">
              {formatDZD(phone.price, dict.common.currency)}
            </div>
          ))}
        </div>

        {SPEC_KEYS.map((key) => (
          <div key={key} role="row" className="contents group/row">
            <div role="rowheader" className="flex items-center border-t border-border/60 py-3 text-sm font-medium text-muted-foreground transition-colors duration-150 group-hover/row:text-foreground">
              {dict.phoneDetails.specLabels[key]}
            </div>
            {phones.map((phone) => (
              <div key={phone.id} role="cell" className="flex items-center justify-center border-t border-border/60 py-3 text-center text-sm text-foreground transition-colors duration-150 group-hover/row:bg-secondary/30">
                {phone.specs?.[key] ?? '—'}
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}