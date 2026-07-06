import type { Locale } from "./dictionary";

function localeTag(locale: Locale) {
  return locale === "es" ? "es-ES" : "en-US";
}

export function formatCardDate(published_at: string | null, locale: Locale) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString(localeTag(locale), { month: "short", year: "numeric" })
    .toUpperCase()
    .replace(".", "");
}

export function formatFullDate(published_at: string | null, locale: Locale) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString(localeTag(locale), { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}
