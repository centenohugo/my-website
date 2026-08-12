import type { MetadataRoute } from 'next'
import { absoluteUrl, SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin panel and its login screen carry no public content, and the
      // API routes exist only to feed the infinite-scroll grids.
      disallow: ['/admin', '/login', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
