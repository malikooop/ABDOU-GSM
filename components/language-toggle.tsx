'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-provider'
import { cn } from '@/lib/utils'

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage()

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
      aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground',
        className,
      )}
    >
      <Languages className="size-4" aria-hidden="true" />
      {locale === 'ar' ? 'EN' : 'AR'}
    </button>
  )
}