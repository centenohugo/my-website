import Link from "next/link";
import { adminTypography } from "./theme";

export default function AdminTabs({ active }: { active: "posts" | "projects" }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <Link
        href="/admin"
        className="uppercase"
        style={active === "posts" ? adminTypography.tabActive : adminTypography.tab}
      >
        Posts
      </Link>
      <Link
        href="/admin/projects"
        className="uppercase"
        style={active === "projects" ? adminTypography.tabActive : adminTypography.tab}
      >
        Projects
      </Link>
    </div>
  );
}
