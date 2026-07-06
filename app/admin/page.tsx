import Link from "next/link";
import { sql } from "@/lib/db";
import { siteLayout, siteTypography } from "../theme";
import AdminList, { type AdminListItem } from "./AdminList";
import AdminTabs from "./AdminTabs";
import LogoutButton from "./LogoutButton";
import { adminTypography } from "./theme";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const posts = await sql<AdminListItem[]>`
    select slug, title, status
    from posts
    order by created_at desc
  `;

  return (
    <main
      className="mx-auto max-w-3xl pb-16"
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

      <AdminTabs active="posts" />

      <div className="mb-8">
        <Link href="/admin/new" className="uppercase" style={adminTypography.buttonPrimary}>
          + New post
        </Link>
      </div>

      <AdminList items={posts} apiBase="/api/posts" editHrefBase="/admin" emptyLabel="No posts yet." />
    </main>
  );
}
