import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { PhonesCatalogClient } from '@/components/phones-catalog-client'
import { PhonesPageHeader } from '@/components/phones-page-header'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'كل الهواتف — ABDOU GSM',
  description: 'تصفح القائمة الكاملة للهواتف الذكية مع فلاتر متقدمة حسب العلامة والسعر والفئة.',
}

// Matches PhonesCatalogClient's real grid (260px sidebar + fluid results)
// exactly, so swapping the Suspense fallback for real content never shifts
// the layout — a skeleton with different proportions than the real thing
// causes a visible jump the instant data arrives.
function PhonesPageSkeleton() {
  return (
    <div className="grid animate-pulse gap-10 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div className="h-[420px] rounded-2xl border border-border bg-card shadow-elevation-sm" />
      <div>
        <div className="mb-8 h-4 w-32 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-64 rounded-2xl border border-border bg-card" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PhonesPage() {
  const settings = await getSiteSettings()

  return (
    <div className="min-h-dvh">
      <SiteHeader logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <main className="pb-24 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <PhonesPageHeader />

          <Suspense fallback={<PhonesPageSkeleton />}>
            <PhonesCatalogClient />
          </Suspense>
        </div>
      </main>
      <SiteFooter logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <MobileBottomNav />
    </div>
  )
}