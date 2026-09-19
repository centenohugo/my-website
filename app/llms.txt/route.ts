import { isoDay, listPublishedPosts, listPublishedProjects, localizeEntry } from '@/lib/content'
import { DEFAULT_LOCALE } from '@/lib/i18n/dictionary'
import { absoluteUrl, SITE_AUTHOR } from '@/lib/site'

// llms.txt (llmstxt.org): a curated, hand-sized index of the site for agents
// that would otherwise have to crawl and guess. Every entry links to the
// Markdown mirror, so following one link gives the full text of that page.
export const revalidate = 3600

function formatDate(value: string | null) {
  return isoDay(value) ?? 'unpublished'
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = []
  let projects: Awaited<ReturnType<typeof listPublishedProjects>> = []

  try {
    ;[posts, projects] = await Promise.all([listPublishedPosts(), listPublishedProjects()])
  } catch (error) {
    console.error('llms.txt: could not list published content', error)
  }

  const lines: string[] = [
    `# ${SITE_AUTHOR.name}`,
    '',
    `> Personal site of ${SITE_AUTHOR.name}, an engineering student who writes about what he builds.`,
    `> It holds a blog, a set of project write-ups and an about page. Nothing else: there is no`,
    `> product, no pricing and no public API.`,
    '',
    'Every post and project is also served as plain Markdown at the same URL with `.md` appended',
    '(for example `/blog/some-post.md`). Add `?lang=es` for the Spanish version where one exists;',
    'the HTML pages pick their language from a cookie, the Markdown mirrors from that query.',
    '',
    '## Pages',
    '',
    `- [Home](${absoluteUrl('/')}): the three sections of the site.`,
    `- [Blog](${absoluteUrl('/blog')}): every published post, newest first.`,
    `- [Projects](${absoluteUrl('/projects')}): project write-ups with their stage and links.`,
    `- [About](${absoluteUrl('/about')}): who ${SITE_AUTHOR.name} is, plus contact and social links.`,
    '',
  ]

  lines.push('## Blog posts', '')
  if (posts.length === 0) {
    lines.push('- No published posts yet.', '')
  } else {
    for (const post of posts) {
      const { title, subtitle } = localizeEntry(post, DEFAULT_LOCALE)
      const note = [subtitle, `published ${formatDate(post.published_at)}`]
        .filter(Boolean)
        .join(' — ')
      lines.push(`- [${title}](${absoluteUrl(`/blog/${post.slug}.md`)}): ${note}`)
    }
    lines.push('')
  }

  lines.push('## Projects', '')
  if (projects.length === 0) {
    lines.push('- No published projects yet.', '')
  } else {
    for (const project of projects) {
      const { title, subtitle } = localizeEntry(project, DEFAULT_LOCALE)
      const note = [subtitle, `stage: ${project.stage.replace('_', ' ')}`]
        .filter(Boolean)
        .join(' — ')
      lines.push(`- [${title}](${absoluteUrl(`/projects/${project.slug}.md`)}): ${note}`)
    }
    lines.push('')
  }

  lines.push(
    '## Optional',
    '',
    `- [Sitemap](${absoluteUrl('/sitemap.xml')}): every indexable URL with its last-modified date.`,
    `- [GitHub](${SITE_AUTHOR.sameAs[0]}): source code, including this site.`,
    `- [Contact](mailto:${SITE_AUTHOR.email}): email is the reliable way to reach him.`,
    ''
  )

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
