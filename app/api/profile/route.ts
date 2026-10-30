import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'

export async function PUT(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const bio = typeof body?.bio === 'string' ? body.bio.trim() : ''

  // Required: an empty one would silently fall back to the built-in copy.
  if (!bio) {
    return NextResponse.json({ error: 'The bio is required' }, { status: 400 })
  }

  await sql`
    insert into site_profile (id, bio)
    values (true, ${bio})
    on conflict (id) do update
      set bio = excluded.bio, updated_at = now()
  `

  return NextResponse.json({ bio })
}
