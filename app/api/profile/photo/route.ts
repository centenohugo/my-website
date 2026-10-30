import { del, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { deleteProfilePhotosExcept, PROFILE_PHOTO_FOLDER } from '@/lib/blob'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'

export const runtime = 'nodejs'

// The landing circle is 208px; this covers it at 3x density.
const PHOTO_SIZE = 640

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 })
  }

  // The admin crops in the browser and sends a square, but the server still
  // squares and sizes it so the stored photo never depends on the client.
  let webpBuffer: Buffer
  try {
    webpBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer()
  } catch (err) {
    console.error('profile photo: sharp conversion failed', err)
    return NextResponse.json(
      { error: 'Unsupported or corrupted image' },
      { status: 400 }
    )
  }

  // A random suffix gives every photo a new URL, so no CDN or browser cache can
  // keep serving the previous one. Copied into a fresh buffer for the same
  // SharedArrayBuffer reason as app/api/upload/route.ts.
  let url: string
  try {
    const blob = await put(PROFILE_PHOTO_FOLDER + 'photo.webp', Buffer.from(webpBuffer), {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/webp',
    })
    url = blob.url
  } catch (err) {
    console.error('profile photo: blob put failed', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Blob upload failed' },
      { status: 500 }
    )
  }

  try {
    await sql`
      insert into site_profile (id, photo_url)
      values (true, ${url})
      on conflict (id) do update
        set photo_url = excluded.photo_url, updated_at = now()
    `
  } catch (err) {
    console.error('profile photo: could not save the new URL', err)
    // Nothing points at the new blob, so drop it and keep the old photo.
    await del(url).catch(() => {})
    return NextResponse.json({ error: 'Could not save the photo' }, { status: 500 })
  }

  // Only once the database points at the new photo is the old one unused.
  await deleteProfilePhotosExcept(url)

  return NextResponse.json({ url })
}
