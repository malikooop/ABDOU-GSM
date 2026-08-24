import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { BackButton } from '@/components/back-button'
import { PhoneDetailsView } from '@/components/phone-details-view'
import { PhoneNotFound } from '@/components/phone-not-found'
import { getPhone } from '@/lib/api'
import { getSiteSettings } from '@/lib/settings'
import { withDerivedAnalysis } from '@/lib/analyze'

interface PhoneDetailsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PhoneDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const phone = Number.isFinite(Number(id)) ? await getPhone(Number(id)) : null

  if (!phone) {
    return {
      title: 'الهاتف غير موجود',
      description: 'الهاتف المطلوب غير متوفر في قاعدة البيانات.',
    }
  }

  const title = `${phone.brand} ${phone.model}`

  return {
    // BUG FIX: this previously only set `openGraph.title/description`, so
    // the actual browser tab <title> and the plain meta description (the
    // ones search engines and browser tabs read — openGraph only covers
    // link-preview cards on social apps) fell back to the site-wide
    // default "ABDOU GSM" on every single phone page. Setting both here
    // fixes tab titles and SEO for every phone.
    title,
    description: phone.highlight,
    openGraph: {
      title,
      description: phone.highlight,
      images: phone.image ? [{ url: phone.image }] : [],
    },
  }
}

export default async function PhoneDetailsPage({ params }: PhoneDetailsPageProps) {
  const { id: idParam } = await params
  const id = Number(idParam)

  const phone = Number.isFinite(id) ? await getPhone(id) : null
  const settings = await getSiteSettings()

  if (!phone) {
    return (
      <div className="min-h-dvh">
        <SiteHeader logoUrl={settings.logoUrl} siteName={settings.siteName} />
        <PhoneNotFound />
        <SiteFooter logoUrl={settings.logoUrl} siteName={settings.siteName} />
        <MobileBottomNav />
      </div>
    )
  }

  const enriched = withDerivedAnalysis(phone)

  return (
    <div className="min-h-dvh">
      <SiteHeader logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <main className="pb-24 md:pb-12">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <BackButton fallbackHref="/phones" />
        </div>

        <PhoneDetailsView phone={enriched} />
      </main>
      <SiteFooter logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <MobileBottomNav />
    </div>
  )
}