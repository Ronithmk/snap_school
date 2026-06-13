"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Images, ShoppingBag } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ScenicBackground } from "@/components/shared/scenic-background";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useLogout, useSession } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.5_0.1_290/45%)]"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.replace(routes.parentLogin());
  }

  return (
    <RouteGuard allowedRoles={["parent"]}>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 glass-navbar px-4 sm:px-6">
          <Link href={routes.parent.root()}>
            <Logo />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 sm:flex">
            <NavLink href={routes.parent.root()} label="My children" icon={Images} />
            <NavLink href={routes.parent.orders()} label="Orders" icon={ShoppingBag} />
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {user ? <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span> : null}
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <nav className="flex items-center gap-1 border-b border-border/60 px-4 py-2 sm:hidden">
          <NavLink href={routes.parent.root()} label="My children" icon={Images} />
          <NavLink href={routes.parent.orders()} label="Orders" icon={ShoppingBag} />
        </nav>

        <main className="bg-gradient-luxury relative flex-1 overflow-hidden p-4 sm:p-6">
          <ScenicBackground />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </RouteGuard>
  );
}
