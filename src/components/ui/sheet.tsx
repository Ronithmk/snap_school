"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "bottom";
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const SIDE_CLASSES: Record<NonNullable<SheetProps["side"]>, string> = {
  right: "inset-y-0 right-0 h-full w-full max-w-sm border-l data-[state=open]:slide-in-from-right",
  left: "inset-y-0 left-0 h-full w-full max-w-sm border-r data-[state=open]:slide-in-from-left",
  bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t data-[state=open]:slide-in-from-bottom",
};

/**
 * Lightweight slide-over panel (mobile nav, cart drawer) — portal + backdrop + escape/scroll-lock,
 * hand-rolled to avoid depending on overlay primitives that weren't resolvable in this environment.
 */
export function Sheet({ open, onOpenChange, side = "right", title, description, children, className }: SheetProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-state={open ? "open" : "closed"}
        className={cn(
          "absolute flex flex-col gap-0",
          "glass-navbar border-border",
          "shadow-[0_8px_40px_oklch(0_0_0/50%)]",
          side === "left" && "animate-slide-in-left",
          side === "right" && "animate-slide-in-right",
          side === "bottom" && "animate-slide-in-up",
          SIDE_CLASSES[side],
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
