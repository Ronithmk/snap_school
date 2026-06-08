"use client";

import { useEffect, type ReactNode } from "react";
import { useUiStore } from "@/stores/ui.store";

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

/**
 * Applies the persisted theme preference to <html>. Pairs with the inline script in the root
 * layout that sets the class pre-hydration to avoid a flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return <>{children}</>;
}

/** Inline script string injected before hydration to prevent theme flash. Reads the same persisted key as `useUiStore`. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('snapschool.ui');
    var theme = raw ? (JSON.parse(raw).state || {}).theme : 'system';
    var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`;
