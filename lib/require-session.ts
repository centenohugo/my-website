import { cookies } from 'next/headers'
import { isValidSessionToken, SESSION_COOKIE } from './auth'

export async function hasValidSession() {
  const cookieStore = await cookies()
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}
