'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Menu, Settings, Smartphone, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LogoutButton from '@/components/LogoutButton'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/phones', label: 'الهواتف', icon: Smartphone },
  { href: '/admin/images', label: 'الصور', icon: ImageIcon },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkAuth()

    // Re-check on every auth state change, not just sign-out: if the
    // session changes to a different (non-admin) account, the admin UI
    // must not keep rendering under the old assumption.
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // This mirrors the real boundary (middleware.ts + RLS on `profiles`),
  // it does not replace it. A logged-out or non-admin request never even
  // reaches this component in normal navigation — this only covers the
  // case where a session's admin status changes *while* already on an
  // admin page (e.g. a revoked admin flag, or a stale client-side cache),
  // since only the server can be trusted for the first-load decision.
  async function checkAuth() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.replace('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      router.replace('/')
      return
    }

    setCheckingAuth(false)
  }

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Same Escape-to-close + scroll-lock treatment already used for the
  // main site header's mobile menu — this is the second off-canvas menu
  // in the app and it deserves the same accessibility guarantees.
  useEffect(() => {
    if (!sidebarOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [sidebarOpen])

  function isActive(href: string) {
    return href === '/admin' ? pathname === href : pathname.startsWith(href)
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">جارٍ التحقق من الدخول...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-secondary/20">
      <div className="flex">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Fixed dark surface regardless of the active theme — sidebars in
            premium dashboards (Vercel, Linear, Notion) are usually a
            deliberate, constant visual anchor, not something that flips
            with light/dark mode. Using bg-foreground here would turn the
            sidebar white in dark mode (foreground is light in .dark),
            which is the opposite of the intended look. */}
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-30 flex min-h-dvh w-64 flex-col bg-[#0B0D17] p-6 text-white transition-transform duration-300 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          )}
        >
          <div className="mb-10 flex items-center gap-2.5">
            <span className="gradient-primary grid size-9 shrink-0 place-items-center rounded-xl shadow-elevation-sm">
              <Smartphone className="size-[18px]" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span className="font-display text-base font-bold">ABDOU GSM</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 border-t border-white/10 pt-6">
            <LogoutButton />
          </div>
        </aside>

        <main className="min-h-dvh flex-1">
          <header className="flex items-center gap-4 border-b border-border/60 bg-background px-6 py-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <h2 className="font-display text-lg font-semibold text-foreground">لوحة الإدارة</h2>
          </header>

          <div className="p-6 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}