import { NextResponse } from 'next/server'
import { hasValidSession } from '@/lib/require-session'
import { translateToSpanish } from '@/lib/translate'

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, subtitle = null, content } = body

  if (!title || !content) {
    return NextResponse.json(
      { error: 'title and content are required' },
      { status: 400 }
    )
  }

  try {
    const translated = await translateToSpanish({ title, subtitle, content })
    const translated_by =
      translated.source === 'local'
        ? `Raspberry Pi (${translated.model})`
        : `OpenRouter · fallback (${translated.model})`
    return NextResponse.json({
      title_es: translated.title,
      subtitle_es: translated.subtitle,
      content_es: translated.content,
      source: translated.source,
      translated_by,
      duration_ms: translated.durationMs,
    })
  } catch (error) {
    console.error('Translation failed', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 })
  }
}
