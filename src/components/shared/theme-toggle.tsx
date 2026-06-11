"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useUiStore, type Theme } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

interface ThemeToggleProps {
  size?: "sm" | "default";
}

export function ThemeToggle({ size = "sm" }: ThemeToggleProps) {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-border/70 bg-background/50 p-1 backdrop-blur-sm">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={`Use ${label.toLowerCase()} theme`}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center rounded-lg transition-all duration-150",
            size === "default" ? "h-9 w-9" : "h-7 w-7",
            theme === value
              ? "bg-foreground/8 text-foreground shadow-[0_1px_3px_oklch(0_0_0/10%)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className={size === "default" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        </button>
      ))}
    </div>
  );
}
