'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { toLatinDigits } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * A numeric input that is guaranteed to stay Latin-digit, everywhere.
 *
 * Why not `<input type="number">`: on several mobile browsers (notably
 * with an Arabic system keyboard/locale), the native number input renders
 * its own value — and its spin-button digits — using the Arabic-Indic
 * numbering system, and it does so independent of the element's `lang`
 * attribute. There is no reliable cross-browser way to force a native
 * number input to stay Latin.
 *
 * This component sidesteps the whole problem: it's a `type="text"` field
 * (so the browser never reformats the value itself) with `inputMode` set
 * to bring up a numeric keyboard, and every keystroke is normalized —
 * Arabic-Indic/Persian digits mapped to ASCII, anything else stripped —
 * before it reaches the caller's `onChange`. The increment/decrement
 * buttons are custom (not the native spinner) so the stepping UX survives
 * the switch from type="number".
 *
 * The whole control is forced `dir="ltr"` regardless of page direction —
 * standard practice for numeric fields inside an RTL layout, so digits
 * and the stepper always read left-to-right and never get bidi-reordered.
 */
export function NumericField({
  id,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  decimal = false,
  className,
  stepperClassName,
  'aria-label': ariaLabel,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  /** Allow a single decimal point (e.g. a 0–10 score field). */
  decimal?: boolean
  className?: string
  stepperClassName?: string
  'aria-label'?: string
}) {
  function sanitize(raw: string): string {
    let v = toLatinDigits(raw)
    v = decimal ? v.replace(/[^0-9.]/g, '') : v.replace(/[^0-9]/g, '')
    if (decimal) {
      const firstDot = v.indexOf('.')
      if (firstDot !== -1) {
        v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '')
      }
    }
    return v
  }

  function clamp(n: number): number {
    if (min != null && n < min) return min
    if (max != null && n > max) return max
    return n
  }

  function bump(delta: number) {
    const current = Number.parseFloat(value || '0') || 0
    const next = clamp(Math.round((current + delta) * 100) / 100)
    onChange(decimal ? String(next) : String(Math.round(next)))
  }

  return (
    <div dir="ltr" className="relative">
      <input
        id={id}
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        pattern={decimal ? '[0-9]*[.]?[0-9]*' : '[0-9]*'}
        lang="en"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(sanitize(e.target.value))}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(className, 'pr-7')}
      />
      <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => bump(step)}
          aria-label="Increase"
          className={cn(
            'flex h-3.5 w-4 items-center justify-center rounded-sm text-muted-foreground/70 transition-colors hover:text-primary',
            stepperClassName,
          )}
        >
          <ChevronUp className="size-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => bump(-step)}
          aria-label="Decrease"
          className={cn(
            'flex h-3.5 w-4 items-center justify-center rounded-sm text-muted-foreground/70 transition-colors hover:text-primary',
            stepperClassName,
          )}
        >
          <ChevronDown className="size-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
