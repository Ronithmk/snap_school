"use client";

import { useServerInsertedHTML } from "next/navigation";
import { THEME_INIT_SCRIPT } from "./theme-provider";

/**
 * Injects the theme-initialisation script into the SSR stream via
 * useServerInsertedHTML so it lives outside React's virtual DOM.
 * React 19 warns about <script> tags rendered as components; this
 * sidesteps that entirely — the tag never appears in the React tree.
 */
export function ThemeScript() {
  useServerInsertedHTML(() => (
    // biome-ignore lint: script must run before hydration
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  ));
  return null;
}
