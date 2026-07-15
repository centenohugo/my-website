"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminList, { type AdminListItem } from "./AdminList";
import { adminTypography } from "./theme";

type Tab = "posts" | "projects";

export default function AdminTabs({
  posts,
  projects,
}: {
  posts: AdminListItem[];
  projects: AdminListItem[];
}) {
  // The URL is the source of truth for the active tab, so back/forward and
  // history restores always render the tab the URL says.
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "projects" ? "projects" : "posts";

  function switchTab(next: Tab) {
    if (next === tab) return;
    // pushState integrates with the Next.js router (updates useSearchParams
    // without a server round-trip) and makes each tab switch a history entry,
    // so the back button returns to the previous tab.
    window.history.pushState(null, "", next === "projects" ? "/admin?tab=projects" : "/admin");
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => switchTab("posts")}
          className="uppercase"
          style={tab === "posts" ? adminTypography.tabActive : adminTypography.tab}
        >
          Posts
        </button>
        <button
          type="button"
          onClick={() => switchTab("projects")}
          className="uppercase"
          style={tab === "projects" ? adminTypography.tabActive : adminTypography.tab}
        >
          Projects
        </button>
      </div>

      <div className="mb-8">
        {tab === "projects" ? (
          <Link href="/admin/projects/new" className="uppercase" style={adminTypography.buttonPrimary}>
            + New project
          </Link>
        ) : (
          <Link href="/admin/new" className="uppercase" style={adminTypography.buttonPrimary}>
            + New post
          </Link>
        )}
      </div>

      {tab === "projects" ? (
        <AdminList
          items={projects}
          apiBase="/api/projects"
          editHrefBase="/admin/projects"
          emptyLabel="No projects yet."
        />
      ) : (
        <AdminList items={posts} apiBase="/api/posts" editHrefBase="/admin" emptyLabel="No posts yet." />
      )}
    </>
  );
}
