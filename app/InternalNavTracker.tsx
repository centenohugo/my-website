"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { backEligibleKey, clearNavState, parentPath } from "./navHistory";

export default function InternalNavTracker() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  // Take full control of scroll position ourselves: the browser's own automatic
  // restoration races with client-side navigations and with Next's own scroll
  // handling, so pages that need to restore scroll (e.g. BlogGrid) do it manually.
  // A fresh mount also means a hard reload / direct URL hit, not a client-side
  // navigation, so any leftover nav bookkeeping from an earlier session in this
  // tab is stale and must not be reused.
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    clearNavState();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPathname.current = pathname;
      return;
    }
    sessionStorage.setItem(
      backEligibleKey(pathname),
      previousPathname.current === parentPath(pathname) ? "1" : "0"
    );
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
}
