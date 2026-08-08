'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-provider'

export function BackButton({
  fallbackHref = '/',
  label,
}: {
  fallbackHref?: string
  label?: string
}) {
  const router = useRouter()
  const { dict, locale } = useLanguage()

  // "Back" points opposite the reading direction: right in RTL (Arabic),
  // left in LTR (English). Hardcoding one icon meant it pointed the wrong
  // way whenever the language toggle switched to English.
  const Icon = locale === 'ar' ? ArrowRight : ArrowLeft

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => {
        // Prefer real browser history so "back" feels natural, but fall back
        // to a known-good route when the details/compare page was opened
        // directly (e.g. from a shared link) and there's no history to pop.
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
        } else {
          router.push(fallbackHref)
        }
      }}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label ?? dict.common.back}
    </button>
  )
}