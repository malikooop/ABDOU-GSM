'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { PhoneCategory } from '@/lib/types'

// Semantic UI tokens only — chart colors (--chart-1..5) are reserved for
// data visualization and shouldn't double as badge colors, or a future
// chart palette change would silently reshuffle these badges too.
const STYLES: Record<PhoneCategory, string> = {
  Flagship: 'bg-warning/15 text-warning',
  'Upper Mid-Range': 'bg-primary/15 text-primary',
  'Mid-Range': 'bg-accent/15 text-accent',
  Budget: 'bg-success/15 text-success',
}

const FALLBACK_STYLE = 'bg-muted text-muted-foreground'

export function CategoryBadge({
  category,
  className,
}: {
  category: PhoneCategory
  className?: string
}) {
  const { dict, locale } = useLanguage()

  // `category` is really a free-text DB column (the admin form is a plain
  // <input>, not a <select>), so a value outside the four known keys is a
  // realistic runtime case — fall back instead of rendering nothing.
  const label =
    dict.categories[category] ?? category ?? (locale === 'ar' ? 'غير مصنّف' : 'Uncategorized')
  const style = STYLES[category] ?? FALLBACK_STYLE

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        style,
        className,
      )}
    >
      {label}
    </span>
  )
}