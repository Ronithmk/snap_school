"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Receipt,
  Settings,
  Tags,
  Wand2,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useSession } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: routes.dashboard.root(), label: "Overview", icon: LayoutDashboard },
  { href: routes.dashboard.analytics(), label: "Analytics", icon: BarChart3 },
  { href: routes.dashboard.orders(), label: "Orders", icon: Receipt },
  { href: routes.dashboard.schools(), label: "Schools", icon: Building2, roles: ["platform_admin"] },
  { href: routes.dashboard.priceLists(), label: "Price Lists", icon: Tags },
  { href: routes.dashboard.settings(), label: "Settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function DashboardNav({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useSession();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = href === routes.dashboard.root() ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar p-4 lg:flex">
      <div className="px-2 py-2">
        <Logo />
      </div>
      <div className="mt-6">
        <DashboardNav />
      </div>
    </aside>
  );
}
