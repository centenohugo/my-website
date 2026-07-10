"use client";

import Link from "next/link";
import { useState } from "react";
import AdminList, { type AdminListItem } from "./AdminList";
import { adminTypography } from "./theme";

type Tab = "posts" | "projects";

export default function AdminTabs({
  initialTab,
  posts,
  projects,
}: {
  initialTab: Tab;
  posts: AdminListItem[];
  projects: AdminListItem[];
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  function switchTab(next: Tab) {
    setTab(next);
    // Keep the tab in the URL (refresh/back/bookmark) without a server round-trip.
    window.history.replaceState(null, "", next === "projects" ? "/admin?tab=projects" : "/admin");
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
