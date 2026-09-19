import type { MetadataRoute } from 'next'
import { isoDateTime, listPublishedPosts, listPublishedProjects } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

// Regenerated hourly: new posts appear without a redeploy, and the file stays
// cheap enough that a crawler hitting it repeatedly costs nothing.
export const revalidate = 3600

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
  { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
  { url: absoluteUrl('/projects'), changeFrequency: 'weekly', priority: 0.8 },
  { url: absoluteUrl('/about'), changeFrequency: 'yearly', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = []
  let projects: Awaited<ReturnType<typeof listPublishedProjects>> = []

  try {
    ;[posts, projects] = await Promise.all([listPublishedPosts(), listPublishedProjects()])
  } catch (error) {
    // A database hiccup should degrade the sitemap to its static routes, not
    // fail the build or serve a 500 to a crawler.
    console.error('sitemap: could not list published content', error)
  }

  return [
    ...STATIC_ROUTES,
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: isoDateTime(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: isoDateTime(project.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
