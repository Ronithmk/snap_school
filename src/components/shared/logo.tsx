import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-[0_2px_8px_oklch(0_0_0/25%)]">
        <Camera className="h-4 w-4" />
      </span>
      <span className="text-gradient">{siteConfig.name}</span>
    </span>
  );
}
