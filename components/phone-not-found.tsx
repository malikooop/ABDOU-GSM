'use client'

import { BackButton } from '@/components/back-button'
import { useLanguage } from '@/lib/i18n/language-provider'

export function PhoneNotFound() {
  const { dict } = useLanguage()

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        {dict.phoneDetails.notFoundTitle}
      </h1>
      <p className="text-sm text-muted-foreground">{dict.phoneDetails.notFoundDescription}</p>
      <BackButton fallbackHref="/phones" label={dict.phoneDetails.backToPhones} />
    </main>
  )
}