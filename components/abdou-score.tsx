import { cn } from '@/lib/utils'
import { formatScore } from '@/lib/format'

interface AbdouScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
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
export function AbdouScore({ score, size = 'md', className }: AbdouScoreProps) {
  // Data can come from a nullable DB column (e.g. Supabase `abdou_score`),
  // so a caller passing `null`/`undefined`/NaN through as `number` is a
  // realistic scenario, not just a type-checker edge case. Without this
  // guard, pct becomes NaN, the conic-gradient silently fails to render
  // any progress, and formatScore(score) would show "NaN" in the badge.
  const safeScore = Number.isFinite(score) ? score : 0
  const pct = Math.max(0, Math.min(100, (safeScore / 10) * 100))
  const tone = scoreTone(safeScore)
  const { dimensions, ring, label } = SIZE_CONFIG[size]

  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full',
        dimensions,
        className,
      )}
      role="img"
      aria-label={`ABDOU SCORE ${formatScore(safeScore)} من 10`}
      style={{
        background: `conic-gradient(${tone} ${pct}%, var(--secondary) ${pct}%)`,
      }}
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