const NAV_PREFIX = "nav:";
const BACK_ELIGIBLE_PREFIX = `${NAV_PREFIX}canGoBack:`;

export function parentPath(pathname: string): string | null {
  if (pathname === "/") return null;
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  // "/edit" routes live one level deeper than the list they belong to
  // (e.g. /admin/[slug]/edit has no /admin/[slug] page — /admin is the list),
  // so they need to climb two segments instead of one.
  const levels = segments[segments.length - 1] === "edit" ? 2 : 1;
  const parentSegments = segments.slice(0, -levels);
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
