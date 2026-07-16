import { cookies } from 'next/headers'
import { isValidSessionToken, SESSION_COOKIE } from './auth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Returns the ?share= value if it is a well-formed token, otherwise null.
// Postgres would reject a malformed value cast to uuid, so filter it here.
export function toShareToken(value: string | string[] | undefined): string | null {
  return typeof value === 'string' && UUID_RE.test(value) ? value : null
}

export async function hasAdminSession() {
  return isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value)
}
