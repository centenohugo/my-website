"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { INTERNAL_HISTORY_KEY } from "./InternalNavTracker";
import { siteTypography } from "./theme";

function parentPath(pathname: string): string | null {
  if (pathname === "/") return null;
  const trimmed = pathname.replace(/\/+$/, "");
  const parent = trimmed.slice(0, trimmed.lastIndexOf("/"));
  return parent === "" ? "/" : parent;
}

export default function BackLink() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(sessionStorage.getItem(INTERNAL_HISTORY_KEY) === "1");
  }, [pathname]);

  const fallbackHref = parentPath(pathname);
  if (fallbackHref === null) return null;

  if (!canGoBack) {
    return (
      <Link href={fallbackHref} className="uppercase" style={siteTypography.backLink}>
        ← Volver
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="uppercase"
      style={siteTypography.backLink}
    >
      ← Volver
    </button>
  );
}
