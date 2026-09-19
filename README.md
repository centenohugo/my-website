## Database

This project uses Postgres (Vercel Postgres in production, local Postgres in dev).

1. Copy `.env.local.example` to `.env.local` and set `POSTGRES_URL` for your local database.
2. Start the local database, either:
   - Docker: `docker compose up -d`
   - Native Windows install: make sure `blog` database exists.
3. Run pending migrations: `npm run db:migrate`

New schema changes go in a new numbered file under `migrations/` (e.g. `0002_add_something.sql`) and are applied with `npm run db:migrate` — never edit an already-applied migration file.

## Agent- and crawler-facing surface

The site is built to be readable by AI agents and crawlers, not only by
browsers. Every page is server-rendered, so the answer is in the initial HTML
with no JavaScript needed.

- `/robots.txt` (`app/robots.ts`) — opts every crawler in, including the named
  AI agents, and excludes `/admin`, `/login`, `/api/` and `?share=` links.
- `/sitemap.xml` (`app/sitemap.ts`) — static routes plus every published post
  and project, regenerated hourly.
- `/llms.txt` (`app/llms.txt/route.ts`) — the [llmstxt.org](https://llmstxt.org)
  curated index: what the site is, then one line per page linking to its
  Markdown.
- `/blog/<slug>.md` and `/projects/<slug>.md` — plain-Markdown mirrors of every
  published entry, with YAML front matter. They are rewrites (`next.config.ts`)
  onto `app/markdown/[kind]/[slug]/route.ts`, and each HTML page advertises its
  mirror with `<link rel="alternate" type="text/markdown">`. Add `?lang=es` for
  the Spanish version where one exists.
- JSON-LD (`app/JsonLd.tsx`) on the home, about, post and project pages.

`NEXT_PUBLIC_SITE_URL` drives every absolute URL in that list — see
`lib/site.ts`.
