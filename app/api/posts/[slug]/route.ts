import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'
import { slugify } from '@/lib/slug'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/posts/[slug]'>
) {
  const { slug } = await ctx.params
  const isAuthed = await hasValidSession()

  const [post] = isAuthed
    ? await sql`select * from posts where slug = ${slug}`
    : await sql`select * from posts where slug = ${slug} and status = 'published'`

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/posts/[slug]'>
) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await ctx.params
  const [existing] = await sql`select * from posts where slug = ${slug}`

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const {
    title,
    content,
    status,
    slug: requestedSlug,
    subtitle,
    image_url,
    title_es,
    subtitle_es,
    content_es,
  } = body

  const newSlug = requestedSlug ? slugify(requestedSlug) : existing.slug
  const newStatus = status ?? existing.status
  const publishedAt =
    newStatus === 'published' && existing.status !== 'published'
      ? new Date()
      : existing.published_at

  try {
    const [updated] = await sql`
      update posts set
        title = ${title ?? existing.title},
        subtitle = ${subtitle !== undefined ? subtitle : existing.subtitle},
        slug = ${newSlug},
        content = ${content ?? existing.content},
        status = ${newStatus},
        published_at = ${publishedAt},
        image_url = ${image_url !== undefined ? image_url : existing.image_url},
        title_es = ${title_es !== undefined ? title_es : existing.title_es},
        subtitle_es = ${subtitle_es !== undefined ? subtitle_es : existing.subtitle_es},
        content_es = ${content_es !== undefined ? content_es : existing.content_es},
        updated_at = now()
      where id = ${existing.id}
      returning id, title, subtitle, slug, status, created_at, updated_at, published_at, image_url, title_es, subtitle_es, content_es
    `
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: `slug "${newSlug}" is already in use` },
        { status: 409 }
      )
    }
    throw error
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/posts/[slug]'>
) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await ctx.params
  const [deleted] = await sql`
    delete from posts where slug = ${slug} returning id
  `

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
