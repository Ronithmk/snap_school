import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-foreground/90 text-background",
        secondary:
          "border border-border bg-muted text-muted-foreground",
        outline:
          "border border-border text-foreground bg-transparent",
        positive:
          "border border-border/50 bg-foreground/8 text-foreground",
        warning:
          "border border-border/40 bg-muted text-muted-foreground",
        negative:
          "border border-destructive/30 bg-destructive/10 text-destructive",
        neutral:
          "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
