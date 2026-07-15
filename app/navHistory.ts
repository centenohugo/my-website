const NAV_PREFIX = "nav:";
const BACK_ELIGIBLE_PREFIX = `${NAV_PREFIX}canGoBack:`;

export function parentPath(pathname: string): string | null {
  if (pathname === "/") return null;
  // Admin editor pages (/admin/new, /admin/[slug]/edit, /admin/projects/new,
  // /admin/projects/[slug]/edit) all belong to the /admin list — there is no
  // /admin/projects page; projects live in a tab of /admin.
  if (pathname.startsWith("/admin/")) {
    return pathname.startsWith("/admin/projects/") ? "/admin?tab=projects" : "/admin";
  }
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const parentSegments = segments.slice(0, -1);
  return parentSegments.length === 0 ? "/" : `/${parentSegments.join("/")}`;
}

export function backEligibleKey(pathname: string): string {
  return `${BACK_ELIGIBLE_PREFIX}${pathname}`;
}

// Anything under the "nav:" namespace only makes sense within a single SPA
// session — a hard reload (direct URL, refresh) means there's no real
// "previous page" to go back to, so stale entries from an earlier session in
// this tab must not leak into it.
export function clearNavState() {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(NAV_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
