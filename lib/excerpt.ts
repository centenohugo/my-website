// Meta descriptions and JSON-LD `description` need plain prose. Post bodies are
// markdown, so strip the syntax rather than shipping "## Heading" into a SERP.

const RULES: [RegExp, string][] = [
  [/```[\s\S]*?```/g, ' '], // fenced code blocks
  [/`([^`]*)`/g, '$1'], // inline code
  [/!\[[^\]]*\]\([^)]*\)/g, ' '], // images
  [/\[([^\]]*)\]\([^)]*\)/g, '$1'], // links keep their label
  [/^\s{0,3}#{1,6}\s+/gm, ''], // heading markers
  [/^\s{0,3}>\s?/gm, ''], // blockquote markers
  [/^\s{0,3}([-*+]|\d+\.)\s+/gm, ''], // list markers
  [/^\s{0,3}([-*_]\s?){3,}$/gm, ' '], // horizontal rules
  [/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1'], // emphasis
  [/<[^>]+>/g, ' '], // raw html
  [/\s+/g, ' '], // collapse whitespace
]

const MAX_LENGTH = 155

/**
 * Flatten markdown to a single line of prose, truncated on a word boundary.
 * Returns an empty string for empty input so callers can fall back.
 */
export function toExcerpt(markdown: string | null | undefined, maxLength = MAX_LENGTH): string {
  if (!markdown) return ''

  const text = RULES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), markdown).trim()

  if (text.length <= maxLength) return text

  const clipped = text.slice(0, maxLength)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}
