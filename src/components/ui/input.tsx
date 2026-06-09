import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground backdrop-blur-sm",
        "placeholder:text-muted-foreground/60",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/25",
        "hover:border-border/80",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
