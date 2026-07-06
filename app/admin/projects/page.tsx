import Link from "next/link";
import { sql } from "@/lib/db";
import { siteLayout, siteTypography } from "../../theme";
import AdminList, { type AdminListItem } from "../AdminList";
import AdminTabs from "../AdminTabs";
import LogoutButton from "../LogoutButton";
import { adminTypography } from "../theme";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await sql<AdminListItem[]>`
    select slug, title, status
    from projects
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

      <AdminTabs active="projects" />

      <div className="mb-8">
        <Link href="/admin/projects/new" className="uppercase" style={adminTypography.buttonPrimary}>
          + New project
        </Link>
      </div>

      <AdminList
        items={projects}
        apiBase="/api/projects"
        editHrefBase="/admin/projects"
        emptyLabel="No projects yet."
      />
    </main>
  );
}
