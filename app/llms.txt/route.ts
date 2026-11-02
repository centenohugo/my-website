import { listPublishedProjects } from '@/lib/content'
import { absoluteUrl, SITE_AUTHOR } from '@/lib/site'

// llms.txt (llmstxt.org): a curated, hand-sized index of the site for agents
// that would otherwise have to crawl and guess. Every entry links to the
// Markdown mirror, so following one link gives the full text of that page.
export const revalidate = 3600

export async function GET() {
  let projects: Awaited<ReturnType<typeof listPublishedProjects>> = []

  try {
    projects = await listPublishedProjects()
  } catch (error) {
    console.error('llms.txt: could not list published content', error)
  }

  const lines: string[] = [
    `# ${SITE_AUTHOR.name}`,
    '',
    `> Personal site of ${SITE_AUTHOR.name}, an engineering student who writes about what he builds.`,
    `> It holds an about page with the project write-ups below it. Nothing else: there is no`,
    `> product, no pricing and no public API.`,
    '',
    'Every project is also served as plain Markdown at the same URL with `.md` appended',
    '(for example `/projects/some-project.md`).',
    '',
    '## Pages',
    '',
    `- [Home](${absoluteUrl('/')}): who ${SITE_AUTHOR.name} is, plus contact and social links, followed by every published project with its stage.`,
    '',
  ]

  lines.push('## Projects', '')
  if (projects.length === 0) {
    lines.push('- No published projects yet.', '')
  } else {
    for (const project of projects) {
      const { title, subtitle } = project
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
