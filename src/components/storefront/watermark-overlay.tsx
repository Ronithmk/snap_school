"use client";

import type { WatermarkSettings } from "@/types/tenant";
import { cn } from "@/lib/utils";

interface Props {
  watermark: WatermarkSettings | undefined;
  className?: string;
}

export function WatermarkOverlay({ watermark, className }: Props) {
  if (!watermark?.enabled) return null;

  const visibleLines = watermark.lines.filter(Boolean);
  if (!visibleLines.length) return null;

  const alpha = Math.min(0.40, Math.max(0.05, watermark.opacity ?? 0.20));
  const rgb = watermark.color === "black" ? "0,0,0" : "255,255,255";
  const textColor = `rgba(${rgb},${alpha})`;
  const shadow =
    watermark.color === "white"
      ? "0 1px 4px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.3)"
      : "0 1px 4px rgba(255,255,255,0.5), 0 0 2px rgba(255,255,255,0.3)";

  const textStyle: React.CSSProperties = {
    color: textColor,
    textShadow: shadow,
    userSelect: "none",
    fontWeight: 700,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    lineHeight: 1.5,
    textAlign: "center",
    fontSize: "clamp(9px, 1.8vw, 16px)",
    whiteSpace: "nowrap",
  };

  const lines = (
    <>
      {visibleLines.map((line, i) => (
        <span key={i} style={{ display: "block" }}>{line}</span>
      ))}
    </>
  );

  if (watermark.pattern === "tiled") {
    return (
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden="true"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            height: "100%",
            width: "100%",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ transform: "rotate(-25deg)", ...textStyle }}>{lines}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (watermark.pattern === "center") {
    return (
      <div
        className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", className)}
        aria-hidden="true"
      >
        <div style={textStyle}>{lines}</div>
      </div>
    );
  }

  // diagonal (default)
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", className)}
      aria-hidden="true"
    >
      <div style={{ transform: "rotate(-30deg)", ...textStyle }}>{lines}</div>
    </div>
  );
}
