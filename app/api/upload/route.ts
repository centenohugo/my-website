import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { assetFolder, isAssetId, isBlobKind } from '@/lib/blob'
import { hasValidSession } from '@/lib/require-session'
import { slugify } from '@/lib/slug'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file')
  const kind = form.get('kind')
  const assetId = form.get('assetId')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  // The folder path is built server-side from an allowlisted kind and a UUID
  // so the client can never write outside posts/<uuid>/ or projects/<uuid>/.
  if (!isBlobKind(kind)) {
    return NextResponse.json(
      { error: 'kind must be "post" or "project"' },
      { status: 400 }
    )
  }
  if (!isAssetId(assetId)) {
    return NextResponse.json(
      { error: 'assetId must be a UUID' },
      { status: 400 }
    )
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 })
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())

  let webpBuffer: Buffer
  try {
    webpBuffer = await sharp(inputBuffer).webp({ quality: 80 }).toBuffer()
  } catch (err) {
    console.error('upload: sharp conversion failed', err)
    return NextResponse.json(
      { error: 'Unsupported or corrupted image' },
      { status: 400 }
    )
  }

  const baseName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image'
  const pathname = assetFolder(kind, assetId) + baseName + '.webp'

  // On Vercel's runtime sharp can return memory backed by a SharedArrayBuffer,
  // which the fetch() inside put() rejects ("SharedArrayBuffer is not
  // allowed"). Copy into a fresh, non-shared buffer before uploading.
  const body = Buffer.from(webpBuffer)

  try {
    const blob = await put(pathname, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/webp',
    })
    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('upload: blob put failed', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Blob upload failed' },
      { status: 500 }
    )
  }
}
