import { sql } from "@/lib/db";
import { siteLayout, siteTypography } from "../theme";
import { type AdminListItem } from "./AdminList";
import AdminTabs from "./AdminTabs";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [posts, projects] = await Promise.all([
    sql<AdminListItem[]>`
      select slug, title, status, share_token
      from posts
      order by created_at desc
    `,
    sql<AdminListItem[]>`
      select slug, title, status, share_token
      from projects
      order by created_at desc
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
