import Link from "next/link";
import { Camera, GraduationCap, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "AI Features", href: "#ai-features" },
] as const;

const PORTAL_LINKS = [
  { label: "School", href: routes.login(), icon: GraduationCap },
  { label: "Parent", href: routes.parentLogin(), icon: Users },
  { label: "Studio", href: routes.adminLogin(), icon: Camera },
] as const;

/** Floating navbar with a permanent glass background. */
export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
      <div
        className={cn(
          "glass-navbar flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-2.5 shadow-[0_8px_32px_oklch(0_0_0/10%)] transition-all duration-300",
        )}
      >
        <Logo size="lg" />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="glass-hero rounded-full px-3.5 py-2 text-sm font-medium text-hero-foreground/80 transition-colors hover:text-hero-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            {PORTAL_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="glass-hero inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-hero-foreground/80 shadow-sm transition-colors hover:text-hero-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{label}</span>
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <ThemeToggle size="default" />
          </div>
          <Link
            href={routes.support()}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "animate-gradient-shift rounded-full bg-[image:var(--gradient-aurora)] px-3 text-base shadow-[0_12px_36px_-8px_rgba(201,154,182,0.7)] sm:px-6 lg:px-8",
            )}
          >
            <Sparkles className="h-5 w-5" />
            <span className="hidden sm:inline">Book Demo</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
