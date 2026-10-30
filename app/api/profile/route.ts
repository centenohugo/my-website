import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hasValidSession } from '@/lib/require-session'

export async function PUT(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const bio = typeof body?.bio === 'string' ? body.bio.trim() : ''
  const bioEs = typeof body?.bio_es === 'string' ? body.bio_es.trim() : ''

  // Both are required: an empty one would silently fall back to the built-in
  // copy, which by then is out of date with whatever the other one says.
  if (!bio || !bioEs) {
    return NextResponse.json(
      { error: 'Both the English and the Spanish bio are required' },
      { status: 400 }
    )
  }

  await sql`
    insert into site_profile (id, bio, bio_es)
    values (true, ${bio}, ${bioEs})
    on conflict (id) do update
      set bio = excluded.bio, bio_es = excluded.bio_es, updated_at = now()
  `

  return NextResponse.json({ bio, bio_es: bioEs })
}
