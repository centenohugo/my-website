import { cache } from 'react'
import { sql } from '@/lib/db'
import type { ProjectStage } from '../theme'

export type ProjectDetail = {
  title: string
  subtitle: string | null
  content: string
  // timestamptz comes back from the driver as a Date, not a string.
  published_at: Date | null
  updated_at: Date | null
  image_url: string | null
  stage: ProjectStage
  repo_url: string | null
  live_url: string | null
  status: 'draft' | 'published'
}

/**
 * `generateMetadata` and the page component both need the project, and both run
 * on the same request. React's `cache` dedupes them to a single round-trip —
 * the visibility arguments are part of the key, and both callers derive them
 * the same way, so they hit.
 */
export const getProject = cache(async function getProject(
  slug: string,
  isAdmin: boolean,
  shareToken: string | null
): Promise<ProjectDetail | null> {
  const [project] = await sql<ProjectDetail[]>`
    select title, subtitle, content,
           published_at, updated_at, image_url, stage, repo_url, live_url, status
    from projects
    where slug = ${slug}
      and (status = 'published' or ${isAdmin} or share_token = ${shareToken})
  `
  return project ?? null
})
