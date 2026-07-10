import postgres from 'postgres'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not set')
}

const isLocal = process.env.POSTGRES_URL.includes('localhost')

export const sql = postgres(process.env.POSTGRES_URL, {
  ssl: isLocal ? false : 'require',
  // Supabase's connection pooler (Supavisor, transaction mode) does not
  // support prepared statements. Disable them for any non-local connection.
  prepare: isLocal,
})
