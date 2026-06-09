import type { Locale } from "@/config/i18n";
import en, { type Dictionary } from "./dictionaries/en";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string ? string : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const loaders: Record<Locale, () => Promise<DeepPartial<Dictionary>>> = {
  en: () => Promise.resolve(en),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
};

function deepMerge<T extends Record<string, unknown>>(base: T, overrides: DeepPartial<T>): T {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const overrideValue = overrides[key];
    const baseValue = base[key];
    if (
      overrideValue &&
      typeof overrideValue === "object" &&
      baseValue &&
      typeof baseValue === "object"
    ) {
      result[key as string] = deepMerge(baseValue as Record<string, unknown>, overrideValue as DeepPartial<Record<string, unknown>>);
    } else if (overrideValue !== undefined) {
      result[key as string] = overrideValue;
    }
  }
  return result as T;
}

/** Returns the full dictionary for a locale, with English as the fallback for missing keys. */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "en") return en;
  const overrides = await loaders[locale]();
  return deepMerge(en, overrides);
}

export type { Dictionary };
