"use client";

import { useEffect } from "react";

export function useScreenshotPrevention() {
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => {
      // Only block on actual media / photo elements
      const target = e.target as HTMLElement;
      if (target.closest("[data-protected]")) e.preventDefault();
    };

    const blockKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key;

      // PrintScreen — briefly blank the viewport so any screenshot captures nothing
      if (key === "PrintScreen") {
        document.documentElement.style.visibility = "hidden";
        requestAnimationFrame(() => {
          document.documentElement.style.visibility = "";
        });
        return;
      }

      // Ctrl+S — save page (embeds images in HTML)
      // Ctrl+P — print / print-to-PDF
      if (ctrl && (key === "s" || key === "S" || key === "p" || key === "P")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys, true);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys, true);
    };
  }, []);
}
