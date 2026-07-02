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
  const { title, content, status, slug: requestedSlug } = body

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
        slug = ${newSlug},
        content = ${content ?? existing.content},
        status = ${newStatus},
        published_at = ${publishedAt},
        updated_at = now()
      where id = ${existing.id}
      returning id, title, slug, status, created_at, updated_at, published_at
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
