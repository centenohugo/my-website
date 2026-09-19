import { getPublishedDoc, isContentKind, isoDay } from '@/lib/content'
import { toLocale } from '@/lib/i18n/dictionary'
import { absoluteUrl } from '@/lib/site'

// Plain-Markdown mirror of every published post and project. Agents fetch
// Markdown far more often than HTML, and the body is already stored as
// Markdown, so this is the source text rather than a scrape of the rendered
// page. Reachable as /blog/<slug>.md and /projects/<slug>.md (see the rewrites
// in next.config.ts), which is the convention llms.txt readers probe for.
export const revalidate = 3600

function frontMatterValue(value: string) {
  // Quote and escape so a title with a colon can't break the YAML block.
  return JSON.stringify(value)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; slug: string }> }
) {
  const { kind, slug } = await params
  if (!isContentKind(kind)) {
    return new Response('Not found\n', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  }

  // The site picks its language from a cookie; agents have none, so the
  // Markdown mirror takes it from an explicit ?lang= and defaults to English.
  const locale = toLocale(new URL(request.url).searchParams.get('lang') ?? undefined)

  const doc = await getPublishedDoc(kind, slug, locale)
  if (!doc) {
    return new Response('Not found\n', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  }

  const canonical = absoluteUrl(`/${kind}/${slug}`)
  const frontMatter = [
    '---',
    `title: ${frontMatterValue(doc.title)}`,
    doc.subtitle ? `description: ${frontMatterValue(doc.subtitle)}` : null,
    `type: ${kind === 'blog' ? 'blog post' : 'project'}`,
    doc.stage ? `stage: ${doc.stage}` : null,
    doc.published_at ? `published: ${isoDay(doc.published_at)}` : null,
    `updated: ${isoDay(doc.updated_at)}`,
    `language: ${locale}`,
    `canonical_url: ${canonical}`,
    doc.repo_url ? `repository: ${doc.repo_url}` : null,
    doc.live_url ? `live_url: ${doc.live_url}` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n')

  const body = [
    frontMatter,
    '',
    `# ${doc.title}`,
    doc.subtitle ? `\n> ${doc.subtitle}` : null,
    '',
    doc.content.trim(),
    '',
  ]
    .filter((line) => line !== null)
    .join('\n')

  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      // HTML and Markdown are separate representations of the same page; keep
      // shared caches from serving one where the other was asked for.
      vary: 'Accept',
      link: `<${canonical}>; rel="canonical"`,
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
