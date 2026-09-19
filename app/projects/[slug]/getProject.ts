import { cache } from 'react'
import { sql } from '@/lib/db'
import type { ProjectStage } from '../theme'

export type ProjectDetail = {
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
  stage: ProjectStage
  repo_url: string | null
  live_url: string | null
  status: 'draft' | 'published'
}

/** See the note in ../../blog/[slug]/getPost.ts — same request-scoped dedupe. */
export const getProject = cache(async function getProject(
  slug: string,
  isAdmin: boolean,
  shareToken: string | null
): Promise<ProjectDetail | null> {
  const [project] = await sql<ProjectDetail[]>`
    select title, subtitle, content, title_es, subtitle_es, content_es,
           published_at, updated_at, image_url, stage, repo_url, live_url, status
    from projects
    where slug = ${slug}
      and (status = 'published' or ${isAdmin} or share_token = ${shareToken})
  `
  return project ?? null
})
