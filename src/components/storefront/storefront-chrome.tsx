import Link from "next/link";
import { Camera } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import type { School } from "@/types";

interface TenantHeaderProps {
  school: School;
}

/** Persistent chrome for every page under `/[school]` — keeps the tenant's identity visible while staying on-brand. */
export function StorefrontHeader({ school }: TenantHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href={routes.storefront.school(school.slug)} className="flex min-w-0 items-center gap-2.5">
          <Avatar src={school.logoUrl} alt={school.name} fallback={school.name.slice(0, 2).toUpperCase()} className="h-9 w-9 shrink-0" />
          <span className="truncate font-semibold tracking-tight">{school.name}</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={routes.home()}
            className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <Camera className="h-3.5 w-3.5" />
            Powered by {siteConfig.name}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter({ school }: TenantHeaderProps) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {school.name}. All photos are protected and may not be reproduced without purchase.</p>
        <Link href={routes.home()} className="font-medium text-foreground transition-colors hover:text-primary">
          Find your school on {siteConfig.name}
        </Link>
      </div>
    </footer>
  );
}
