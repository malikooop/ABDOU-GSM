import type { MetadataRoute } from 'next'
import { getPhones } from '@/lib/api'

const BASE_URL = 'https://abdougsm.com'

// Dynamic: every individual /phone/[id] page is included, not just the
// three static top-level routes. Product detail pages are exactly what
// people search for on a phone-comparison site — leaving them out of the
// sitemap was the single biggest missed opportunity here. Falls back to
// the static routes alone if the phones fetch fails (e.g. at build time
// without DB access) rather than failing the whole sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      priority: 1,
      changeFrequency: 'daily',
    },
    {
      url: `${BASE_URL}/phones`,
      priority: 0.9,
      changeFrequency: 'daily',
    },
    {
      url: `${BASE_URL}/compare`,
      priority: 0.8,
      changeFrequency: 'weekly',
    },
  ]

  try {
    const phones = await getPhones()
    const phoneRoutes: MetadataRoute.Sitemap = phones.map((phone) => ({
      url: `${BASE_URL}/phone/${phone.id}`,
      priority: 0.7,
      changeFrequency: 'weekly',
    }))
    return [...staticRoutes, ...phoneRoutes]
  } catch (error) {
    console.error('sitemap: failed to fetch phones, returning static routes only:', error)
    return staticRoutes
  }
}
