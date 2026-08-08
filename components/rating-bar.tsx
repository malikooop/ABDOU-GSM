'use client'

import { cn } from '@/lib/utils'

// Same three-tier logic already used for the score badge on PhoneCard —
// keeps the "what does this number mean" signal consistent everywhere a
// /10 score appears across the site, not just on the card.
function barColorClass(value: number): string {
  if (value >= 9) return 'bg-success'
  if (value >= 6) return 'bg-warning'
  return 'bg-destructive'
}

export function RatingBar({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100))
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColorClass(value))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}