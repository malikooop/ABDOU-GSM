'use client'

import { Check, GitCompareArrows } from 'lucide-react'
import { MAX_COMPARE, useCompareSelection } from '@/lib/compare-store'
import { useLanguage } from '@/lib/i18n/language-provider'
import { cn } from '@/lib/utils'
import type { Phone } from '@/lib/types'

interface CompareToggleButtonProps {
  phone: Phone
}

/**
 * زر إضافة/إزالة هاتف من سلة المقارنة.
 * يُعطَّل تلقائياً عند بلوغ MAX_COMPARE — إلا إذا كان الهاتف نفسه محدَّداً
 * أصلاً، حتى يبقى بالإمكان إزالته.
 */
export function CompareToggleButton({ phone }: CompareToggleButtonProps) {
  const { dict } = useLanguage()
  const { isSelected, toggle, ids } = useCompareSelection()

  const selected = isSelected(phone.id)
  const atLimit = !selected && ids.length >= MAX_COMPARE

  const ariaLabel = selected
    ? `${dict.phoneCard.compareRemove} ${phone.model}`
    : `${dict.phoneCard.compareAdd} ${phone.model}`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      disabled={atLimit}
      title={atLimit ? `${MAX_COMPARE} max` : undefined}
      onClick={() => toggle(phone.id)}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-40',
        selected ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {selected ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <GitCompareArrows className="size-4" aria-hidden="true" />
      )}
      {dict.statsSection.compareValue}
    </button>
  )
}