import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'
import { slugify } from '@/lib/slug'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/projects/[slug]'>
) {
  const { slug } = await ctx.params
  const isAuthed = await hasValidSession()

  const [project] = isAuthed
    ? await sql`select * from projects where slug = ${slug}`
    : await sql`select * from projects where slug = ${slug} and status = 'published'`

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/projects/[slug]'>
) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await ctx.params
  const [existing] = await sql`select * from projects where slug = ${slug}`

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const {
    title,
    content,
    status,
    stage,
    slug: requestedSlug,
    subtitle,
    image_url,
    repo_url,
    live_url,
  } = body

  const newSlug = requestedSlug ? slugify(requestedSlug) : existing.slug
  const newStatus = status ?? existing.status
  const publishedAt =
    newStatus === 'published' && existing.status !== 'published'
      ? new Date()
      : existing.published_at

  try {
    const [updated] = await sql`
      update projects set
        title = ${title ?? existing.title},
        subtitle = ${subtitle !== undefined ? subtitle : existing.subtitle},
        slug = ${newSlug},
        content = ${content ?? existing.content},
        status = ${newStatus},
        stage = ${stage ?? existing.stage},
        published_at = ${publishedAt},
        image_url = ${image_url !== undefined ? image_url : existing.image_url},
        repo_url = ${repo_url !== undefined ? repo_url : existing.repo_url},
        live_url = ${live_url !== undefined ? live_url : existing.live_url},
        updated_at = now()
      where id = ${existing.id}
      returning id, title, subtitle, slug, status, stage, created_at, updated_at, published_at, image_url, repo_url, live_url
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
  ctx: RouteContext<'/api/projects/[slug]'>
) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await ctx.params
  const [deleted] = await sql`
    delete from projects where slug = ${slug} returning id
  `

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
