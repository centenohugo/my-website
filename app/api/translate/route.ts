import { NextResponse } from 'next/server'
import { hasValidSession } from '@/lib/require-session'
import { TranslationTimeoutError, translateToSpanish } from '@/lib/translate'

// Free OpenRouter models can take a while on long articles; without this the
// platform default would cut the request off well before the model replies.
export const maxDuration = 60

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
    return NextResponse.json({
      title_es: translated.title,
      subtitle_es: translated.subtitle,
      content_es: translated.content,
      model: translated.model,
      duration_ms: translated.durationMs,
    })
  } catch (error) {
    if (error instanceof TranslationTimeoutError) {
      console.error('Translation timed out', error)
      return NextResponse.json({ error: 'Translation timed out' }, { status: 504 })
    }
    console.error('Translation failed', error)
    // Everything past the session check is admin-only, so pass the upstream
    // reason through: "request failed: 404" (retired model) and "failed: 401"
    // (dead key) are indistinguishable from a flat "Translation failed".
    const reason = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Translation failed: ${reason}` },
      { status: 502 }
    )
  }
}
