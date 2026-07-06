import en from "./locales/en.json";
import es from "./locales/es.json";

export type Locale = "en" | "es";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries = { en, es };

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function toLocale(value: string | undefined): Locale {
  return value === "es" ? "es" : DEFAULT_LOCALE;
}
