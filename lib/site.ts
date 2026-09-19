// Canonical origin used to build the absolute URLs that crawlers and AI agents
// need: metadata, sitemap.xml, robots.txt, llms.txt and JSON-LD.
//
// Set NEXT_PUBLIC_SITE_URL once a custom domain exists; on Vercel we fall back
// to the production deployment URL so preview builds still advertise the real
// site instead of their own throwaway hostname.
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, '')

/** Absolute URL for a site-relative path, e.g. absoluteUrl('/blog') */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString()
}

/**
 * The public Markdown mirror of a content page. Every blog post and project is
 * also served as plain Markdown at the same URL with `.md` appended, which is
 * what agents ask for first (see next.config.ts for the rewrite).
 */
export function markdownUrl(path: string): string {
  return absoluteUrl(`${path}.md`)
}

export const SITE_AUTHOR = {
  name: 'Hugo Centeno Sanz',
  email: 'hcienteno@gmail.com',
  sameAs: [
    'https://github.com/centenohugo',
    'https://www.linkedin.com/in/hugocentenosanz/',
  ],
} as const
