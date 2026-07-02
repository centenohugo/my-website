import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'
import { slugify } from '@/lib/slug'

export async function GET() {
  const includeDrafts = await hasValidSession()

  const posts = includeDrafts
    ? await sql`
        select id, title, slug, status, created_at, updated_at, published_at
        from posts
        order by created_at desc
      `
    : await sql`
        select id, title, slug, status, created_at, updated_at, published_at
        from posts
        where status = 'published'
        order by published_at desc
      `

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, status = 'draft', slug: requestedSlug } = body

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
      insert into posts (title, slug, content, status, published_at)
      values (${title}, ${slug}, ${content}, ${status}, ${publishedAt})
      returning id, title, slug, status, created_at, updated_at, published_at
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
