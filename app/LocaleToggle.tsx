"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { siteColors, siteLayout, siteTypography } from "./theme";

export default function LocaleToggle() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();

  const hidden = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login" || pathname.startsWith("/login/");
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      aria-label={locale === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
      className="fixed right-0 top-0 z-50 flex items-center gap-1.5"
      style={{
        height: siteLayout.navbarHeight,
        paddingRight: siteLayout.sidePadding,
        cursor: "pointer",
      }}
    >
      <span
        className="uppercase"
        style={{
          ...siteTypography.backLink,
          color: locale === "en" ? siteColors.textCardTitle : siteColors.textMuted,
        }}
      >
        EN
      </span>
      <span aria-hidden style={{ ...siteTypography.backLink, color: siteColors.textMuted }}>
        /
      </span>
      <span
        className="uppercase"
        style={{
          ...siteTypography.backLink,
          color: locale === "es" ? siteColors.textCardTitle : siteColors.textMuted,
        }}
      >
        ES
      </span>
    </button>
  );
}
