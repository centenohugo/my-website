import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'
import { slugify } from '@/lib/slug'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 100)
  const offset = Number(searchParams.get('offset')) || 0

  // Public blog grid consumer: must match the initial server render in
  // app/blog/page.tsx exactly (published only, ordered by published_at desc).
  // Offset pagination assumes one stable ordering across the initial page and
  // every load-more; branching the order/filter on session desynced them and
  // hung the infinite scroll. The admin list uses its own SQL, not this route.
  const posts = await sql`
    select id, title, subtitle, title_es, subtitle_es, slug, status, created_at, updated_at, published_at, image_url
    from posts
    where status = 'published'
    order by published_at desc
    limit ${limit} offset ${offset}
  `

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title,
    content,
    status = 'draft',
    slug: requestedSlug,
    subtitle = null,
    image_url = null,
    title_es = null,
    subtitle_es = null,
    content_es = null,
  } = body

  if (!title || !content) {
    return NextResponse.json(
      { error: 'title and content are required' },
      { status: 400 }
    )
  }

  const slug = slugify(requestedSlug || title)
  const publishedAt = status === 'published' ? new Date() : null

  try {
    const [post] = await sql`
      insert into posts (title, subtitle, slug, content, status, published_at, image_url, title_es, subtitle_es, content_es)
      values (${title}, ${subtitle}, ${slug}, ${content}, ${status}, ${publishedAt}, ${image_url}, ${title_es}, ${subtitle_es}, ${content_es})
      returning id, title, subtitle, slug, status, created_at, updated_at, published_at, image_url, title_es, subtitle_es, content_es
    `
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: `slug "${slug}" is already in use` },
        { status: 409 }
      )
    }
    throw error
  }
}
