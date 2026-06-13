import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function Logo({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight",
        size === "lg" ? "text-lg sm:text-2xl lg:text-3xl" : "text-base",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-[0_2px_8px_oklch(0_0_0/25%)]",
          size === "lg" ? "h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11" : "h-8 w-8",
        )}
      >
        <Camera className={size === "lg" ? "h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" : "h-4 w-4"} />
      </span>
      <span className="text-gradient">{siteConfig.name}</span>
    </span>
  );
}
