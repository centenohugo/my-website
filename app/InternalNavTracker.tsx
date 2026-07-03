"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const INTERNAL_HISTORY_KEY = "hasInternalHistory";

export default function InternalNavTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.setItem(INTERNAL_HISTORY_KEY, "1");
  }, [pathname]);

  return null;
}
