'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { dictionaries, type Dictionary, type Locale } from './dictionary'

export const LOCALE_COOKIE = 'abdou-locale'

interface LanguageContextValue {
  locale: Locale
  dict: Dictionary
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    // 1-year cookie so the root layout (a Server Component) can read the
    // preference on the next request and render <html lang dir> correctly
    // from the very first byte — no flash of the wrong direction/language.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`
  }, [])

  // Keep <html lang/dir> in sync with the current locale. Also covers the
  // rare case where the cookie was changed in another tab.
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, dict: dictionaries[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within <LanguageProvider>')
  }
  return ctx
}