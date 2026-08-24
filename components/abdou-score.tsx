'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatScore } from '@/lib/format'

interface AbdouScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Adds a soft halo in the score's tone color — reserved for a single
   * prominent instance per page (e.g. the hero's featured phone), not
   * every badge, so it reads as emphasis rather than becoming visual
   * noise where scores repeat (compare page, phone details). */
  glow?: boolean
}

const SIZE_CONFIG = {
  sm: { dimensions: 'size-11 text-sm', ring: 'inset-[2px]', label: 'text-[8px]' },
  md: { dimensions: 'size-14 text-base', ring: 'inset-[3px]', label: 'text-[9px]' },
  lg: { dimensions: 'size-20 text-xl', ring: 'inset-1', label: 'text-[10px]' },
} as const

// Single source of truth for "what color does a /10 score get", shared in
// spirit with PhoneCard's badge and RatingBar's fill — same thresholds
// everywhere a score appears, so the same number always reads the same way
// across the site.
function scoreTone(score: number): string {
  if (score >= 9) return 'var(--success)'
  if (score >= 7.5) return 'var(--primary)'
  if (score >= 6) return 'var(--warning)'
  return 'var(--muted-foreground)'
}

/** Circular ABDOU SCORE badge (out of 10) with a subtle progress ring. */
export function AbdouScore({ score, size = 'md', className, glow = false }: AbdouScoreProps) {
  // Data can come from a nullable DB column (e.g. Supabase `abdou_score`),
  // so a caller passing `null`/`undefined`/NaN through as `number` is a
  // realistic scenario, not just a type-checker edge case. Without this
  // guard, pct becomes NaN, the conic-gradient silently fails to render
  // any progress, and formatScore(score) would show "NaN" in the badge.
  const safeScore = Number.isFinite(score) ? score : 0
  const pct = Math.max(0, Math.min(100, (safeScore / 10) * 100))
  const tone = scoreTone(safeScore)
  const { dimensions, ring, label } = SIZE_CONFIG[size]

  // The ring fills in from 0 on mount instead of snapping straight to its
  // final value — this badge is often the first thing a visitor's eye
  // lands on (the hero phone's floating score card), so it's worth the
  // small extra polish. Two-frame trick: paint at 0% first, then on the
  // next frame update to the real value — the CSS transition on
  // --score-pct (registered via @property in globals.css) animates
  // between the two automatically.
  const [animatedPct, setAnimatedPct] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedPct(pct))
    return () => cancelAnimationFrame(frame)
  }, [pct])

  return (
    <div
      className={cn(
        'score-ring relative grid shrink-0 place-items-center rounded-full',
        dimensions,
        className,
      )}
      role="img"
      aria-label={`ABDOU SCORE ${formatScore(safeScore)} من 10`}
      style={
        {
          '--score-pct': `${animatedPct}%`,
          background: `conic-gradient(${tone} var(--score-pct), var(--secondary) var(--score-pct))`,
          boxShadow: glow
            ? `0 0 0 1px color-mix(in srgb, ${tone} 15%, transparent), 0 0 24px -4px color-mix(in srgb, ${tone} 55%, transparent)`
            : `0 0 0 1px color-mix(in srgb, ${tone} 12%, transparent)`,
        } as React.CSSProperties
      }
    >
      {/* Ring thickness scales with badge size so it reads proportionally
          the same at every size instead of looking chunkier on "sm". */}
      <div className={cn('absolute rounded-full bg-card', ring)} />
      <div className="relative flex flex-col items-center leading-none">
        <span className="font-display font-bold text-foreground">
          {formatScore(safeScore)}
        </span>
        <span className={cn('mt-0.5 font-medium text-muted-foreground', label)}>
          SCORE
        </span>
      </div>
    </div>
  )
}
