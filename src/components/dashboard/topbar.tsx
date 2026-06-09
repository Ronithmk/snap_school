"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DashboardNav } from "./sidebar";
import { useLogout, useSession } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/config/constants";
import { routes } from "@/config/routes";

export function DashboardTopbar({ title }: { title?: string }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.replace(routes.login());
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 glass-navbar px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="truncate text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6" />
        {user ? (
          <div className="flex items-center gap-2.5">
            <Avatar src={user.avatarUrl} alt={user.name} fallback={user.name.slice(0, 2).toUpperCase()} className="h-8 w-8" />
            <div className="hidden text-sm leading-tight sm:block">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} side="left" title="Navigation">
        <DashboardNav onNavigate={() => setMobileNavOpen(false)} />
      </Sheet>
    </header>
  );
}
