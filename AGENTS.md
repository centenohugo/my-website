<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dates

`published_at` on `projects` is **the date shown on the page**, not
necessarily when the article went live. It defaults to the moment of first
publication, but the admin form's `DATE` field overrides it so work finished
months ago can be backdated into its real place — public listings sort by this
column, so a backdated article sorts chronologically rather than to the top.

It is a calendar day, not an instant: `lib/publishedDate.ts` stores it at
midnight UTC and `lib/formatDate.ts` renders it with `timeZone: "UTC"`.
Keep both ends pinned. The cards are client components and the detail pages are
server components, so an unpinned format mismatches on hydration and shows a
date stored on the 1st as the previous month to any visitor west of UTC.

# Agent- and crawler-facing surface

The site is built to be readable by AI agents and crawlers, not only by
browsers. Every page is server-rendered, so the answer is in the initial HTML
with no JavaScript needed.

- `/robots.txt` (`app/robots.ts`) — opts every crawler in, including the named
  AI agents, and excludes `/admin`, `/login`, `/api/` and `?share=` links.
- `/sitemap.xml` (`app/sitemap.ts`) — static routes plus every published project,
  regenerated hourly.
- `/llms.txt` (`app/llms.txt/route.ts`) — the [llmstxt.org](https://llmstxt.org)
  curated index: what the site is, then one line per page linking to its
  Markdown.
- `/projects/<slug>.md` — plain-Markdown mirrors of every published project,
  with YAML front matter. They are rewrites (`next.config.ts`) onto
  `app/markdown/projects/[slug]/route.ts`, and each HTML page advertises its
  mirror with `<link rel="alternate" type="text/markdown">`.
- JSON-LD (`app/JsonLd.tsx`) on the home and project pages.

`NEXT_PUBLIC_SITE_URL` drives every absolute URL in that list — see
`lib/site.ts`.
