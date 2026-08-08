import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://abdougsm.com',
      priority: 1,
      changeFrequency: 'daily',
    },
    {
      url: 'https://abdougsm.com/phones',
      priority: 0.9,
      changeFrequency: 'daily',
    },
    {
      url: 'https://abdougsm.com/compare',
      priority: 0.8,
      changeFrequency: 'weekly',
    },
  ]
}