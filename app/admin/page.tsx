import { sql } from "@/lib/db";
import { siteLayout, siteTypography } from "../theme";
import { type AdminListItem } from "./AdminList";
import AdminTabs from "./AdminTabs";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [posts, projects] = await Promise.all([
    // published_at is a calendar day (see lib/publishedDate.ts), so it comes
    // back as a plain YYYY-MM-DD string rather than a timestamp the formatter
    // would have to re-pin to UTC.
    //
    // Both tabs sort newest first on the date the entry actually shows, which is
    // the order the public listings use, so a backdated entry sits in the same
    // place here as it does on the site. Entries with no date yet come first —
    // they are drafts in progress, and burying them at the bottom hides them.
    sql<AdminListItem[]>`
      select slug, title, status, share_token,
             to_char(published_at at time zone 'utc', 'YYYY-MM-DD') as published_at
      from posts
      order by published_at desc nulls first, created_at desc
    `,
    sql<AdminListItem[]>`
      select slug, title, status, share_token,
             to_char(published_at at time zone 'utc', 'YYYY-MM-DD') as published_at
      from projects
      order by published_at desc nulls first, created_at desc
    `,
  ]);

  return (
    <main
      className="mx-auto w-full max-w-3xl pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <header className="mb-10 flex items-center justify-between gap-4">
        <h1 style={siteTypography.pageTitle}>Manage content</h1>
        <LogoutButton />
      </header>

      <AdminTabs posts={posts} projects={projects} />
    </main>
  );
}
