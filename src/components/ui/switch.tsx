"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, className, ...props }, ref) => (
    <label className={cn("group inline-flex cursor-pointer items-center", className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          "h-6 w-11 shrink-0 rounded-full border border-border/40 bg-foreground/12 transition-colors duration-200",
          "peer-checked:bg-foreground peer-checked:border-foreground/20 peer-focus-visible:ring-2 peer-focus-visible:ring-ring/30 peer-focus-visible:ring-offset-2",
          "relative after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5",
        )}
      />
    </label>
  ),
);
Switch.displayName = "Switch";
