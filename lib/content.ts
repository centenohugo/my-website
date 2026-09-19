import { cache } from 'react'
import { sql } from './db'
import type { Locale } from './i18n/dictionary'

export type ContentKind = 'blog' | 'projects'

export const CONTENT_KINDS: ContentKind[] = ['blog', 'projects']

export function isContentKind(value: string): value is ContentKind {
  return (CONTENT_KINDS as string[]).includes(value)
}

/** Row shape shared by the sitemap and llms.txt listings. */
export type PublishedEntry = {
  slug: string
  title: string
  subtitle: string | null
  title_es: string | null
  subtitle_es: string | null
  published_at: string | null
  updated_at: string
}

export type PublishedProject = PublishedEntry & { stage: string }

// cache() dedupes these within a single request, so a route handler can list
// entries without worrying about which other component already asked.
export const listPublishedPosts = cache(async (): Promise<PublishedEntry[]> => {
  return sql<PublishedEntry[]>`
    select slug, title, subtitle, title_es, subtitle_es, published_at, updated_at
    from posts
    where status = 'published'
    order by published_at desc nulls last
  `
})

export const listPublishedProjects = cache(async (): Promise<PublishedProject[]> => {
  return sql<PublishedProject[]>`
    select slug, title, subtitle, title_es, subtitle_es, published_at, updated_at, stage
    from projects
    where status = 'published'
    order by published_at desc nulls last
  `
})

/** Full body of one published entry, used by the Markdown mirrors. */
export type ContentDoc = {
  title: string
  subtitle: string | null
  content: string
  published_at: string | null
  updated_at: string
  repo_url: string | null
  live_url: string | null
  stage: string | null
}

type RawDoc = ContentDoc & {
  title_es: string | null
  subtitle_es: string | null
  content_es: string | null
}

export const getPublishedDoc = cache(
  async (kind: ContentKind, slug: string, locale: Locale): Promise<ContentDoc | null> => {
    // Two literal queries instead of an interpolated table name: the column
    // lists differ and the kind never reaches the database as a value.
    const [row] =
      kind === 'blog'
        ? await sql<RawDoc[]>`
            select title, subtitle, content, title_es, subtitle_es, content_es,
                   published_at, updated_at, null as repo_url, null as live_url, null as stage
            from posts
            where slug = ${slug} and status = 'published'
          `
        : await sql<RawDoc[]>`
            select title, subtitle, content, title_es, subtitle_es, content_es,
                   published_at, updated_at, repo_url, live_url, stage
            from projects
            where slug = ${slug} and status = 'published'
          `

    if (!row) return null

    // Spanish is a partial translation: fall back field by field, never mixing
    // a translated title onto an untranslated body without saying so.
    const es = locale === 'es'
    return {
      ...row,
      title: es && row.title_es ? row.title_es : row.title,
      subtitle: es && row.subtitle_es ? row.subtitle_es : row.subtitle,
      content: es && row.content_es ? row.content_es : row.content,
    }
  }
)

/** Picks the localized title/subtitle for a listing row. */
export function localizeEntry(entry: PublishedEntry, locale: Locale) {
  const es = locale === 'es'
  return {
    title: es && entry.title_es ? entry.title_es : entry.title,
    subtitle: es && entry.subtitle_es ? entry.subtitle_es : entry.subtitle,
  }
}

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
