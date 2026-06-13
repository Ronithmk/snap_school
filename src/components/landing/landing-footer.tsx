import Link from "next/link";
import { Camera, GraduationCap, Users } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const PORTAL_LINKS = [
  { label: "School Admin", href: routes.login(), icon: GraduationCap },
  { label: "Parent Login", href: routes.parentLogin(), icon: Users },
  { label: "Studio Login", href: routes.adminLogin(), icon: Camera },
] as const;

/** Closing footer — logo, portal links, and support. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-foreground/[0.015] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              The AI-powered operating system for school and event photography — from capture to checkout.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PORTAL_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SnapSchool. All rights reserved.</p>
          <Link href={routes.support()} className={cn(buttonVariants({ variant: "default", size: "lg" }), "rounded-full px-8 text-base")}>
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
