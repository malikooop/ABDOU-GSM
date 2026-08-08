import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { BackButton } from '@/components/back-button'
import { ComparePageClient } from '@/components/compare-page-client'

export const metadata: Metadata = {
  title: 'مقارنة الهواتف — ABDOU GSM',
  description: 'قارن بين هاتفين أو أكثر جنباً إلى جنب حسب المواصفات والسعر و ABDOU SCORE.',
}

export default function ComparePage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="pb-24 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-4">
            <BackButton fallbackHref="/phones" />
          </div>
          <div className="mb-10">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              مقارنة الهواتف
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              مقارنة جنباً إلى جنب حسب المواصفات، السعر، و ABDOU SCORE
            </p>
          </div>

          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-secondary/30" />}>
            <ComparePageClient />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  )
}