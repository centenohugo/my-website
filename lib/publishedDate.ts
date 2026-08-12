// published_at is the date shown on the page, not necessarily the moment the
// article went live: it can be backdated by hand so work finished months ago
// sorts into its real place. Everything here treats it as a calendar day pinned
// to UTC, so the day typed in the admin form is the day every visitor sees
// regardless of their timezone.

const DATE_INPUT = /^\d{4}-\d{2}-\d{2}/

/**
 * Turn an <input type="date"> value into the instant to store.
 *
 * Returns `undefined` when the key was absent from the request body (leave the
 * existing value alone) and `null` when it was present but empty (clear it).
 * These are deliberately different: emptying the field in the admin form is how
 * a date is removed.
 */
export function parseDateInput(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string') return undefined

  const match = value.match(DATE_INPUT)
  if (!match) return undefined

  const date = new Date(`${match[0]}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Turn a stored timestamp into the ISO-8601 string metadata expects.
 *
 * The `postgres` driver hands back `Date` objects for timestamptz columns. Next
 * stringifies Open Graph values directly, so passing the Date through yields a
 * literal "[object Object]" in `article:published_time` — coerce here instead.
 */
export function toIsoString(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/**
 * Turn a stored timestamp into an <input type="date"> value. Extracts the day
 * in UTC — using the local getters here would shift the date by one for anyone
 * west of UTC, which is exactly the bug this module exists to avoid.
 */
export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}
