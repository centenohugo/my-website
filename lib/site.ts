// Every absolute URL the site hands to a crawler — canonicals, Open Graph
// images, sitemap entries, JSON-LD @id values — is built from here.
//
// The fallback is localhost on purpose. A wrong absolute URL is worse than a
// missing one: it points canonicals at a domain you don't control. Set
// NEXT_PUBLIC_SITE_URL in the deployment environment and nowhere else.

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, '')

/** Absolute URL for a site-relative path, e.g. absoluteUrl('/blog/foo'). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const AUTHOR_NAME = 'Hugo Centeno Sanz'

/**
 * Profiles that are unambiguously this person, published as schema.org
 * `sameAs`. Only add a URL here once it is confirmed real — a wrong sameAs
 * asserts an identity claim to search engines. (SocialLinks.tsx still carries
 * a TODO about placeholder profiles; those stay out until it's resolved.)
 */
export const AUTHOR_PROFILES = ['https://github.com/centenohugo']
