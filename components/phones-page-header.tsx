'use client'

import { useLanguage } from '@/lib/i18n/language-provider'

export function PhonesPageHeader() {
  const { dict } = useLanguage()

  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        {dict.phonesPage.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{dict.phonesPage.subtitle}</p>
    </div>
  )
}