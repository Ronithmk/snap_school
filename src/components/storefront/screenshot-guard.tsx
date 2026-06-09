"use client";

import { useEffect } from "react";
import { useScreenshotPrevention } from "@/hooks/use-screenshot-prevention";

/**
 * Drop this once inside any server-rendered storefront layout.
 * It attaches keyboard/mouse listeners and injects print-blocking CSS.
 * Renders nothing visible.
 */
export function ScreenshotGuard() {
  useScreenshotPrevention();

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "ss-screenshot-guard";
    style.textContent = `
      /* Prevent drag-to-desktop on images */
      [data-protected] img {
        -webkit-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
      /* Block print / print-to-PDF entirely */
      @media print {
        body > * { display: none !important; }
        body::after {
          content: "Printing is disabled on this page.";
          display: block;
          padding: 40px;
          font-size: 22px;
          font-weight: bold;
          text-align: center;
          color: #000;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("ss-screenshot-guard")?.remove();
  }, []);

  return null;
}
