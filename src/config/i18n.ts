/**
 * Lightweight, non-routed i18n config. Locale lives in user/tenant preference + browser,
 * not the URL — keeps tenant routing (`/[school]/...`) clean. Swap to routed locales later
 * by prefixing `app/[locale]/` if/when full localized SEO is required.
 */
export const SUPPORTED_LOCALES = ["en", "fr", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
