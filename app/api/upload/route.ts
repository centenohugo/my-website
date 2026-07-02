import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { hasValidSession } from '@/lib/require-session'

export const runtime = 'nodejs'

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

  const inputBuffer = Buffer.from(await file.arrayBuffer())
  const webpBuffer = await sharp(inputBuffer).webp({ quality: 80 }).toBuffer()
  const webpName = file.name.replace(/\.[^.]+$/, '') + '.webp'

  const blob = await put(webpName, webpBuffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/webp',
  })

  return NextResponse.json({ url: blob.url })
}
