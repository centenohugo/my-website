import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { sql } from '../lib/db'

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

async function migrate() {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `

  const applied = new Set(
    (await sql`select name from schema_migrations`).map((row) => row.name)
  )

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (applied.has(file)) continue

    const query = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')
    console.log(`Applying ${file}...`)
    await sql.unsafe(query)
    await sql`insert into schema_migrations (name) values (${file})`
  }

  console.log('Migrations up to date.')
  await sql.end()
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
