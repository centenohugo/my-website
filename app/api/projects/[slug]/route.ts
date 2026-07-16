import { NextResponse } from 'next/server'
import { deleteAssetFolder, isAssetId } from '@/lib/blob'
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
    title_es,
    subtitle_es,
    content_es,
    image_url,
    repo_url,
    live_url,
    asset_prefix,
  } = body

  // The blob folder key is immutable once set; only articles from before the
  // folder scheme (asset_prefix null) may adopt one, on their first save.
  const newAssetPrefix =
    existing.asset_prefix ?? (isAssetId(asset_prefix) ? asset_prefix : null)

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
        title_es = ${title_es !== undefined ? title_es : existing.title_es},
        subtitle_es = ${subtitle_es !== undefined ? subtitle_es : existing.subtitle_es},
        content_es = ${content_es !== undefined ? content_es : existing.content_es},
        slug = ${newSlug},
        content = ${content ?? existing.content},
        status = ${newStatus},
        stage = ${stage ?? existing.stage},
        published_at = ${publishedAt},
        image_url = ${image_url !== undefined ? image_url : existing.image_url},
        repo_url = ${repo_url !== undefined ? repo_url : existing.repo_url},
        live_url = ${live_url !== undefined ? live_url : existing.live_url},
        asset_prefix = ${newAssetPrefix},
        updated_at = now()
      where id = ${existing.id}
      returning id, title, subtitle, title_es, subtitle_es, slug, status, stage, created_at, updated_at, published_at, image_url, repo_url, live_url, asset_prefix
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
    delete from projects where slug = ${slug} returning id, asset_prefix
  `

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (deleted.asset_prefix) {
    await deleteAssetFolder('project', deleted.asset_prefix)
  }

  return new NextResponse(null, { status: 204 })
}
