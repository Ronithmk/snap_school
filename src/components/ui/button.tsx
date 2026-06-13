import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:
          "rounded-xl text-primary-foreground bg-[image:var(--gradient-primary)] shadow-[0_6px_20px_-6px_oklch(0.5_0.1_290/50%)] hover:shadow-[0_10px_28px_-6px_oklch(0.5_0.1_290/60%)] hover:brightness-[1.04]",
        secondary:
          "rounded-xl border border-border bg-secondary text-secondary-foreground backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
        outline:
          "rounded-xl border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:border-border/70",
        ghost:
          "rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive:
          "rounded-xl bg-destructive text-destructive-foreground shadow-[0_1px_3px_oklch(0_0_0/20%)] hover:bg-destructive/85",
        link: "text-foreground underline-offset-4 hover:underline",
        glass:
          "rounded-xl glass text-foreground hover:bg-white/[0.07] dark:hover:bg-white/[0.07]",
      },
      size: {
        default:  "h-10 px-4 py-2",
        sm:       "h-8 rounded-lg px-3 text-xs",
        lg:       "h-12 rounded-2xl px-6 text-base",
        icon:     "h-10 w-10 rounded-xl",
        "icon-sm":"h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
