import type { MetadataRoute } from 'next'
import { sql } from '@/lib/db'
import { absoluteUrl } from '@/lib/site'

// This is the only complete list of URLs a crawler can get. The listing pages
// server-render just the first page of cards and load the rest over fetch on
// scroll, so anything past that page exists in no HTML document on the site.
// Until that changes, this file is what makes older entries discoverable.

// Regenerate hourly. Without this the route is prerendered once at build time
// and a post published afterwards never appears.
export const revalidate = 3600

type Entry = {
  slug: string
  published_at: string | null
  updated_at: string | null
  image_url: string | null
}

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
  { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
  { url: absoluteUrl('/projects'), changeFrequency: 'weekly', priority: 0.8 },
  { url: absoluteUrl('/about'), changeFrequency: 'yearly', priority: 0.5 },
]

function toEntries(rows: Entry[], prefix: '/blog' | '/projects'): MetadataRoute.Sitemap {
  return rows.map((row) => ({
    url: absoluteUrl(`${prefix}/${row.slug}`),
    lastModified: row.updated_at ?? row.published_at ?? undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    // An image sitemap entry is the only way these get into Google Images:
    // they render as CSS background-image, so there is no <img> to crawl.
    images: row.image_url ? [row.image_url] : undefined,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [posts, projects] = await Promise.all([
      sql<Entry[]>`
        select slug, published_at, updated_at, image_url
        from posts
        where status = 'published'
        order by published_at desc
      `,
      sql<Entry[]>`
        select slug, published_at, updated_at, image_url
        from projects
        where status = 'published'
        order by published_at desc
      `,
    ])

    return [...STATIC_ROUTES, ...toEntries(posts, '/blog'), ...toEntries(projects, '/projects')]
  } catch {
    // A database hiccup during a revalidate shouldn't serve a broken sitemap or
    // fail the build; the static routes are always correct.
    return STATIC_ROUTES
  }
}
