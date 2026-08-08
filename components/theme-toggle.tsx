'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes only knows the real theme after its blocking script runs on
  // the client. Rendering a guess on the server would cause a hydration
  // mismatch, so we render a neutral placeholder with the same footprint
  // until we're mounted, then swap in the real icon.
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={cn('size-9 rounded-lg', className)} aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground active:scale-95',
        className,
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  )
}