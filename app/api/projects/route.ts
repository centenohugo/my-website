import { NextResponse } from 'next/server'
import { isAssetId } from '@/lib/blob'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'
import { slugify } from '@/lib/slug'

export async function GET(request: Request) {
  const includeDrafts = await hasValidSession()
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 100)
  const offset = Number(searchParams.get('offset')) || 0

  const projects = includeDrafts
    ? await sql`
        select id, title, subtitle, title_es, subtitle_es, slug, status, stage, repo_url, live_url, created_at, updated_at, published_at, image_url
        from projects
        order by created_at desc
        limit ${limit} offset ${offset}
      `
    : await sql`
        select id, title, subtitle, title_es, subtitle_es, slug, status, stage, repo_url, live_url, created_at, updated_at, published_at, image_url
        from projects
        where status = 'published'
        order by published_at desc
        limit ${limit} offset ${offset}
      `

  return NextResponse.json(projects)
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
    stage = 'in_progress',
    slug: requestedSlug,
    subtitle = null,
    title_es = null,
    subtitle_es = null,
    content_es = null,
    image_url = null,
    repo_url = null,
    live_url = null,
    asset_prefix = null,
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
    const [project] = await sql`
      insert into projects (title, subtitle, title_es, subtitle_es, content_es, slug, content, status, stage, published_at, image_url, repo_url, live_url, asset_prefix)
      values (${title}, ${subtitle}, ${title_es}, ${subtitle_es}, ${content_es}, ${slug}, ${content}, ${status}, ${stage}, ${publishedAt}, ${image_url}, ${repo_url}, ${live_url}, ${isAssetId(asset_prefix) ? asset_prefix : null})
      returning id, title, subtitle, title_es, subtitle_es, slug, status, stage, created_at, updated_at, published_at, image_url, repo_url, live_url, asset_prefix
    `
    return NextResponse.json(project, { status: 201 })
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
