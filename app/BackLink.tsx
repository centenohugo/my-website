"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import t from "@/lib/copy";
import { backEligibleKey, parentPath } from "./navHistory";
import { siteTypography } from "./theme";

export default function BackLink() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(sessionStorage.getItem(backEligibleKey(pathname)) === "1");
  }, [pathname]);

  const fallbackHref = parentPath(pathname);
  if (fallbackHref === null) return null;

  if (!canGoBack) {
    return (
      <Link
        href={fallbackHref}
        // a hash target (/#projects) needs Next's scroll to reach the section
        scroll={fallbackHref.includes("#")}
        className="uppercase"
        style={siteTypography.backLink}
      >
        {t.common.backLink}
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
      {t.common.backLink}
    </button>
  );
}
