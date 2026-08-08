'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GitCompareArrows, Home, Smartphone, Sparkles } from 'lucide-react'
import { useCompareSelection } from '@/lib/compare-store'
import { useLanguage } from '@/lib/i18n/language-provider'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const { dict } = useLanguage()
  const pathname = usePathname()
  const { ids } = useCompareSelection()

  const ITEMS = [
    { href: '/', label: dict.nav.home, icon: Home },
    { href: '/phones', label: dict.nav.phones, icon: Smartphone },
    { href: '/#abdou-ai', label: dict.nav.ai, icon: Sparkles },
    { href: '/compare', label: dict.mobileNav.compare, icon: GitCompareArrows },
  ] as const

  return (
    <nav
      aria-label={dict.mobileNav.ariaLabel}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around py-2">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 transition-colors duration-200',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="relative">
                  <Icon className="size-5" aria-hidden="true" />
                  {item.href === '/compare' && ids.length > 0 && (
                    <span className="absolute -end-1.5 -top-1.5 grid size-3.5 place-items-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                      {ids.length}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}