import { del, list } from '@vercel/blob'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isAssetId(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

export function assetFolder(assetId: string) {
  return `projects/${assetId.toLowerCase()}/`
}

// Best-effort removal of every blob under an article's folder. Blob cleanup
// must never block the DB delete that triggered it, so callers should not
// await failures into a user-facing error — this logs and swallows instead.
export async function deleteAssetFolder(assetId: string) {
  if (!isAssetId(assetId)) return

  const prefix = assetFolder(assetId)
  try {
    let cursor: string | undefined
    do {
      const batch = await list({ prefix, cursor })
      if (batch.blobs.length > 0) {
        await del(batch.blobs.map((blob) => blob.url))
      }
      cursor = batch.cursor
    } while (cursor)
  } catch (err) {
    console.error(`blob: failed to clean up ${prefix}`, err)
  }
}

// The landing photo lives on its own, outside the per-article folders. Only the
// current one is kept, so the folder never holds more than a single image.
export const PROFILE_PHOTO_FOLDER = 'profile/'

// Best-effort, like deleteAssetFolder: the new photo is already saved, so a
// leftover old one is clutter in the store, not a broken page.
export async function deleteProfilePhotosExcept(keepUrl: string) {
  try {
    let cursor: string | undefined
    do {
      const batch = await list({ prefix: PROFILE_PHOTO_FOLDER, cursor })
      const stale = batch.blobs
        .map((blob) => blob.url)
        .filter((url) => url !== keepUrl)
      if (stale.length > 0) {
        await del(stale)
      }
      cursor = batch.cursor
    } while (cursor)
  } catch (err) {
    console.error(`blob: failed to clean up ${PROFILE_PHOTO_FOLDER}`, err)
  }
}
