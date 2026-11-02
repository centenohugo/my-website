"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { LandingProfile } from "@/lib/profile";
import AdminList, { type AdminListItem } from "./AdminList";
import LandingForm from "./LandingForm";
import { adminTypography } from "./theme";

const TABS = ["projects", "landing"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  projects: "Projects",
  landing: "Landing",
};

export default function AdminTabs({
  projects,
  profile,
}: {
  projects: AdminListItem[];
  profile: LandingProfile;
}) {
  // The URL is the source of truth for the active tab, so back/forward and
  // history restores always render the tab the URL says.
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: Tab = TABS.find((t) => t === requested) ?? "projects";

  function switchTab(next: Tab) {
    if (next === tab) return;
    // pushState integrates with the Next.js router (updates useSearchParams
    // without a server round-trip) and makes each tab switch a history entry,
    // so the back button returns to the previous tab.
    window.history.pushState(null, "", next === "projects" ? "/admin" : `/admin?tab=${next}`);
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className="uppercase"
            style={tab === t ? adminTypography.tabActive : adminTypography.tab}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "projects" && (
        <>
          <div className="mb-8">
            <Link href="/admin/projects/new" className="uppercase" style={adminTypography.buttonPrimary}>
              + New project
            </Link>
          </div>
          <AdminList
            items={projects}
            apiBase="/api/projects"
            editHrefBase="/admin/projects"
            publicHrefBase="/projects"
            emptyLabel="No projects yet."
          />
        </>
      )}

      {tab === "landing" && <LandingForm initialProfile={profile} />}
    </>
  );
}
