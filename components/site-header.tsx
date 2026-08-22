'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Crown, GitCompareArrows, Home, Menu, Smartphone, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AbdouLogo } from '@/components/abdou-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/lib/i18n/language-provider'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const { dict } = useLanguage()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Same icon set as MobileBottomNav for the same three destinations —
  // desktop and mobile now read as the same navigation, not two designs.
  const NAV_LINKS = [
    { href: '/', label: dict.nav.home, icon: Home },
    { href: '/phones', label: dict.nav.phones, icon: Smartphone },
    { href: '/compare', label: dict.nav.compare, icon: GitCompareArrows },
  ]

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const handleChange = () => {
      if (media.matches) setOpen(false)
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-background/80 backdrop-blur-xl transition-shadow duration-300',
        scrolled ? 'shadow-elevation-sm border-b border-border/40' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="ABDOU GSM">
          <AbdouLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={dict.nav.mainNav}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-200',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <Button
            variant="outline"
            className="hidden rounded-full border-primary/25 font-semibold text-primary transition-transform duration-200 hover:border-primary/40 hover:bg-primary/5 active:scale-95 sm:inline-flex"
            size="lg"
            nativeButton={false}
            render={<Link href="/#abdou-ai" />}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {dict.nav.ai}
          </Button>

          {/* Static badge, not a link — its destination (premium plan?
              admin access?) hasn't been defined yet, so it doesn't point
              anywhere broken. Wire it to a real route once that page
              exists. */}
          <span
            aria-label="ABDOU Premium"
            title="ABDOU Premium"
            className="hidden size-9 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning sm:grid"
          >
            <Crown className="size-4" aria-hidden="true" />
          </span>

          <Button
            variant="ghost"
            size="icon-lg"
            className="md:hidden"
            aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          'grid overflow-hidden border-border/60 transition-all duration-300 md:hidden',
          open ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0">
          <nav className="flex flex-col gap-1 p-4" aria-label={dict.nav.mobileNav}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  pathname === link.href
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center gap-2 sm:hidden">
              <LanguageToggle className="flex-1 justify-center" />
              <ThemeToggle />
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full rounded-full border-primary/25 font-semibold text-primary hover:border-primary/40 hover:bg-primary/5"
              size="lg"
              nativeButton={false}
              render={<Link href="/#abdou-ai" onClick={() => setOpen(false)} />}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {dict.nav.ai}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}