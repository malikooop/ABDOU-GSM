'use client'

import Link from 'next/link'
import { AbdouLogo } from '@/components/abdou-logo'
import { useLanguage } from '@/lib/i18n/language-provider'

interface SiteFooterProps {
  logoUrl?: string | null
  siteName?: string
}

export function SiteFooter({ logoUrl, siteName }: SiteFooterProps = {}) {
  const { dict } = useLanguage()

  const links = [
    { href: '/', label: dict.nav.home },
    { href: '/phones', label: dict.nav.phones },
    { href: '/compare', label: dict.nav.compare },
  ]

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
          <div className="max-w-sm">
            <Link href="/" aria-label={siteName ?? 'ABDOU GSM'} className="inline-flex">
              <AbdouLogo logoUrl={logoUrl} siteName={siteName} />
            </Link>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
              {dict.siteFooter.description}
            </p>
          </div>

          <nav className="flex items-center gap-6" aria-label={dict.nav.mainNav}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          © {new Date().getFullYear()} ABDOU GSM. {dict.siteFooter.rights}
        </p>
      </div>
    </footer>
  )
}