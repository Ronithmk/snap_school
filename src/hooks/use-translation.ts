"use client";

import { useEffect, useState } from "react";
import { useUiStore } from "@/stores/ui.store";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import en from "@/lib/i18n/dictionaries/en";

type Path<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends object
      ? Path<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

export type TranslationKey = Path<Dictionary>;

function resolve(dict: Dictionary, key: string): string {
  const value = key.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], dict);
  return typeof value === "string" ? value : key;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/** Lightweight, language-ready translation hook. Falls back to English while a locale loads. */
export function useTranslation() {
  const locale = useUiStore((s) => s.locale);
  const [dictionary, setDictionary] = useState<Dictionary>(en);

  useEffect(() => {
    let active = true;
    getDictionary(locale).then((dict) => {
      if (active) setDictionary(dict);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return interpolate(resolve(dictionary, key), vars);
  }

  return { t, locale };
}
