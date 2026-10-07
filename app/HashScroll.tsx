"use client";

import { useEffect } from "react";

// Scroll restoration is manual site-wide (see InternalNavTracker), so a
// client-side back() to "/#projects" lands at the top of the page instead of
// at the section. Jump to the hash target on mount. A real browser back/forward
// is left alone: InfiniteCardGrid restores the exact position in that case.
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const [navEntry] = performance.getEntriesByType("navigation");
    if (navEntry instanceof PerformanceNavigationTiming && navEntry.type === "back_forward") {
      return;
    }
    // Two frames late, like InfiniteCardGrid, to win over Next's own scroll handling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView();
      });
    });
  }, []);

  return null;
}
