<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dates

`published_at` on `posts` and `projects` is **the date shown on the page**, not
necessarily when the article went live. It defaults to the moment of first
publication, but the admin form's `DATE` field overrides it so work finished
months ago can be backdated into its real place — public listings sort by this
column, so a backdated article sorts chronologically rather than to the top.

It is a calendar day, not an instant: `lib/publishedDate.ts` stores it at
midnight UTC and `lib/i18n/formatDate.ts` renders it with `timeZone: "UTC"`.
Keep both ends pinned. The cards are client components and the detail pages are
server components, so an unpinned format mismatches on hydration and shows a
date stored on the 1st as the previous month to any visitor west of UTC.
