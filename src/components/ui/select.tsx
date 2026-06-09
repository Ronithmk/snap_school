import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  containerClassName?: string;
}

/**
 * Native <select> styled to match the design system. Fully accessible and keyboard-friendly
 * out of the box — used for country/currency/locale pickers and simple filters.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, children, ...props }, ref) => (
    <span className={cn("relative inline-flex w-full", containerClassName)}>
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-border bg-input px-4 pr-10 text-sm backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/25 hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  ),
);
Select.displayName = "Select";
