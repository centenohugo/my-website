"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { siteColors, siteLayout, siteTypography } from "./theme";

export default function LocaleToggle() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();

  const hidden = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login";
  if (hidden) return null;

  return (
    <div
      className="fixed right-0 top-0 z-50 flex items-center gap-1.5"
      style={{
        height: siteLayout.navbarHeight,
        paddingRight: siteLayout.sidePadding,
      }}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className="uppercase"
        style={{
          ...siteTypography.backLink,
          color: locale === "en" ? siteColors.textCardTitle : siteColors.textMuted,
        }}
      >
        EN
      </button>
      <span aria-hidden style={{ ...siteTypography.backLink, color: siteColors.textMuted }}>
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("es")}
        className="uppercase"
        style={{
          ...siteTypography.backLink,
          color: locale === "es" ? siteColors.textCardTitle : siteColors.textMuted,
        }}
      >
        ES
      </button>
    </div>
  );
}
