import type { Locale } from "./dictionary";

function localeTag(locale: Locale) {
  return locale === "es" ? "es-ES" : "en-US";
}

// published_at is a calendar day, not a moment, so both formatters pin the
// timezone to UTC. Without this the cards (client components) render in the
// visitor's timezone while the detail pages (server components) render in the
// server's, which both mismatches on hydration and shows a date stored at
// midnight as the previous day — and therefore the previous month, on cards.
export function formatCardDate(published_at: string | Date | null, locale: Locale) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString(localeTag(locale), {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase()
    .replace(".", "");
}

export function formatFullDate(published_at: string | Date | null, locale: Locale) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString(localeTag(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}
