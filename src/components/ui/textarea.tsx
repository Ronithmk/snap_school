import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-xl border border-border bg-input px-4 py-3 text-sm backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/25 hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
