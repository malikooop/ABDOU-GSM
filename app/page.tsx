import { SiteHeader } from '@/components/site-header'
import { SearchHero } from '@/components/search-hero'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { StatsSection } from '@/components/stats-section'
import { CategoryNav } from '@/components/category-nav'
import { FeaturedPhones } from '@/components/featured-phones'
import { EditorialPicks } from '@/components/editorial-picks'
import { AiTeaser } from '@/components/ai-teaser'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { SiteFooter } from '@/components/site-footer'
import { getPhones } from '@/lib/api'
import type { Metadata } from 'next'

const HERO_COUNT = 3
const FEATURED_COUNT = 6

export const metadata: Metadata = {
  title: 'ABDOU GSM — اختار هاتفك بذكاء',
  description:
    'قارن أحدث الهواتف الذكية بمواصفاتها وأسعارها، واكتشف أعلى الهواتف تقييمًا حسب تقييم ABDOU GSM قبل ما تشتري.',
  openGraph: {
    title: 'ABDOU GSM — اختار هاتفك بذكاء',
    description:
      'قارن أحدث الهواتف الذكية بمواصفاتها وأسعارها، واكتشف أعلى الهواتف تقييمًا حسب تقييم ABDOU GSM قبل ما تشتري.',
    type: 'website',
  },
}

export default async function HomePage() {
  // getPhones() hits an external API/DB — if it throws (network blip,
  // downtime, etc.) an unguarded call would crash the whole page and the
  // user would see Next's generic error screen with no header, nav, or
  // footer. Falling back to an empty list keeps the shell (header, nav,
  // footer) usable and lets each section render its own empty state
  // instead of taking the entire homepage down.
  let phones: Awaited<ReturnType<typeof getPhones>> = []

  try {
    phones = (await getPhones({ sort: 'score_desc' })) ?? []
  } catch (error) {
    console.error('Failed to load phones for homepage:', error)
    phones = []
  }

  const heroPhones = phones.slice(0, HERO_COUNT)
  // Starts right after the hero's phones so the same top-scoring handsets
  // don't appear twice back-to-back on first load — Featured picks up
  // where Hero left off, giving visitors more variety as they scroll.
  const featured = phones.slice(HERO_COUNT, HERO_COUNT + FEATURED_COUNT)

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <SearchHero phones={phones} />
        <HeroSection phones={heroPhones} />
        <FeaturesSection />
        <StatsSection phones={phones} />
        <FeaturedPhones phones={featured} />
        <CategoryNav />
        <EditorialPicks phones={phones} />
        <AiTeaser phones={phones} />
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  )
}