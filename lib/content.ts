import { cache } from 'react'
import { sql } from './db'

/** Row shape of the llms.txt listing. */
export type PublishedProject = {
  slug: string
  title: string
  subtitle: string | null
  published_at: string | null
  updated_at: string
  stage: string
}

// cache() dedupes this within a single request, so a route handler can list
// projects without worrying about which other component already asked.
export const listPublishedProjects = cache(async (): Promise<PublishedProject[]> => {
  return sql<PublishedProject[]>`
    select slug, title, subtitle, published_at, updated_at, stage
    from projects
    where status = 'published'
    order by published_at desc nulls last
  `
})

/** Full body of one published project, used by the Markdown mirrors. */
export type ProjectDoc = {
  title: string
  subtitle: string | null
  content: string
  published_at: string | null
  updated_at: string
  repo_url: string | null
  live_url: string | null
  stage: string
}

export const getPublishedProjectDoc = cache(
  async (slug: string): Promise<ProjectDoc | null> => {
    const [row] = await sql<ProjectDoc[]>`
      select title, subtitle, content,
             published_at, updated_at, repo_url, live_url, stage
      from projects
      where slug = ${slug} and status = 'published'
    `

    return row ?? null
  }
)

/**
 * A plain-text summary for meta descriptions, built from the body when an
 * entry has no subtitle. Strips the Markdown that would otherwise show up as
 * literal `#` and `[]()` noise in a search result or an agent's summary.
 */
export function excerpt(markdown: string, maxLength = 180): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_`>#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * Machine-readable timestamp for <time datetime>, JSON-LD, Open Graph and the
 * sitemap. The timestamptz columns are typed as strings here but postgres.js
 * hands back Date objects, and only one of those two stringifies correctly on
 * its own — so everything that has to be parsed by a machine goes through this.
 */
export function isoDateTime(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** Same, trimmed to a calendar day (YYYY-MM-DD). */
export function isoDay(value: string | Date | null | undefined): string | undefined {
  return isoDateTime(value)?.slice(0, 10)
}
