import { cache } from 'react'
import { sql } from '@/lib/db'

export type PostDetail = {
  title: string
  subtitle: string | null
  content: string
  title_es: string | null
  subtitle_es: string | null
  content_es: string | null
  // timestamptz comes back from the driver as a Date, not a string.
  published_at: Date | null
  updated_at: Date | null
  image_url: string | null
  status: 'draft' | 'published'
}

/**
 * `generateMetadata` and the page component both need the post, and both run
 * on the same request. React's `cache` dedupes them to a single round-trip —
 * the visibility arguments are part of the key, and both callers derive them
 * the same way, so they hit.
 */
export const getPost = cache(async function getPost(
  slug: string,
  isAdmin: boolean,
  shareToken: string | null
): Promise<PostDetail | null> {
  const [post] = await sql<PostDetail[]>`
    select title, subtitle, content, title_es, subtitle_es, content_es,
           published_at, updated_at, image_url, status
    from posts
    where slug = ${slug}
      and (status = 'published' or ${isAdmin} or share_token = ${shareToken})
  `
  return post ?? null
})
