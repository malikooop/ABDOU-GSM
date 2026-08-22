import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /admin is already blocked server-side for anyone who isn't a
      // signed-in admin (middleware.ts); this just keeps it out of search
      // engine indexes/crawls too, as defense in depth.
      disallow: ['/admin', '/admin/'],
    },
    sitemap: 'https://abdougsm.com/sitemap.xml',
  }
}
