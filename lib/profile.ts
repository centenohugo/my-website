import { cache } from 'react'
import { sql } from './db'
import { getDictionary, type Locale } from './i18n/dictionary'
import { absoluteUrl } from './site'

// Shipped with the site, so the landing has a photo before one is uploaded.
export const DEFAULT_PHOTO_URL = '/me.jpg'

type SiteProfileRow = {
  bio: string | null
  bio_es: string | null
  photo_url: string | null
}

export type LandingProfile = {
  bio: string
  bioEs: string
  photoUrl: string
}

// Wrapped in cache() because the home page reads it twice per request, once in
// generateMetadata and once in the page. A database hiccup returns null: the
// landing falls back to the built-in copy rather than failing to render.
const getSiteProfileRow = cache(async (): Promise<SiteProfileRow | null> => {
  try {
    const [row] = await sql<SiteProfileRow[]>`
      select bio, bio_es, photo_url from site_profile where id
    `
    return row ?? null
  } catch (error) {
    console.error('profile: could not read site_profile', error)
    return null
  }
})

/** Both bios and the photo, with the built-in defaults filling any gap. */
export async function getLandingProfile(): Promise<LandingProfile> {
  const row = await getSiteProfileRow()
  return {
    bio: row?.bio || getDictionary('en').about.bio,
    bioEs: row?.bio_es || getDictionary('es').about.bio,
    photoUrl: row?.photo_url || DEFAULT_PHOTO_URL,
  }
}

export function bioFor(profile: LandingProfile, locale: Locale) {
  return locale === 'es' ? profile.bioEs : profile.bio
}

/** Uploaded photos are already absolute Blob URLs; the default is site-relative. */
export function absolutePhotoUrl(profile: LandingProfile) {
  return profile.photoUrl.startsWith('/')
    ? absoluteUrl(profile.photoUrl)
    : profile.photoUrl
}
