import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000

function sign(payload: string) {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not set')
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function createSessionToken() {
  const payload = String(Date.now() + SESSION_TTL_MS)
  return `${payload}.${sign(payload)}`
}

export function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false
  }

  return Number(payload) > Date.now()
}
