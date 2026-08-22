'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CategoryBadge } from '@/components/category-badge'
import { CompareToggleButton } from '@/components/compare-toggle-button'
import { PhoneImage } from '@/components/phone-image'
import { formatDZD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

interface PhoneCardProps {
  phone: Phone
  className?: string
  style?: React.CSSProperties
}

// Token-based instead of hardcoded Tailwind palette colors — adapts to
// light/dark automatically.
function scoreBadgeClass(score: number): string {
  if (score >= 9) return 'bg-success text-white'
  if (score >= 7.5) return 'bg-primary text-primary-foreground'
  if (score >= 6) return 'bg-warning text-white'
  return 'bg-muted text-muted-foreground'
}

export function PhoneCard({ phone, className, style }: PhoneCardProps) {
  const { dict } = useLanguage()

  const score = Number.isFinite(phone.score) ? phone.score.toFixed(1) : null

  const specLine = [phone.specs?.ram, phone.specs?.storage].filter(Boolean).join(' • ')

  return (
    <article
      style={style}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-md',
        className,
      )}
    >
      <Link
        href={`/phone/${phone.id}`}
        prefetch
        aria-label={`${dict.phoneCard.viewDetailsAria} ${phone.brand} ${phone.model}`}
        className="relative block"
      >
        <div className="relative flex h-64 items-center justify-center overflow-hidden bg-secondary/40">
          {/* Single soft glow — hover-only, not a permanent triple-blur
              stack. This is the card's one moment of emphasis. */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="h-40 w-40 rounded-full bg-primary/20 blur-[64px]" />
          </div>

          <PhoneImage
            phone={phone}
            className="p-4 transition-transform duration-500 group-hover:scale-105"
          />

          {score && (
            <div
              className={cn(
                'absolute start-4 top-4 rounded-full px-3 py-1 text-sm font-bold shadow-elevation-sm',
                scoreBadgeClass(phone.score),
              )}
            >
              {score}
            </div>
          )}

          <div className="absolute end-4 top-4">
            <CategoryBadge category={phone.category} />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground">{phone.brand}</p>

        <Link href={`/phone/${phone.id}`} prefetch>
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
            {phone.model}
          </h3>
        </Link>

        {specLine && <p className="mt-3 text-sm text-muted-foreground">{specLine}</p>}

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <span className="font-display text-3xl font-bold tracking-tight text-primary">
              {formatDZD(phone.price)}
            </span>
            <CompareToggleButton phone={phone} />
          </div>

          <Link
            href={`/phone/${phone.id}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-3 text-sm font-semibold transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            {dict.phoneCard.detailsCta}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}