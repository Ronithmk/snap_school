"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import type { UserRole } from "@/types";

interface RouteGuardProps {
  /** Roles allowed to view this subtree. Omit to allow any authenticated user. */
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

/**
 * Client-side guard for protected sections (dashboard). Redirects unauthenticated users to
 * `/auth/login?from=<path>` and blocks roles that aren't permitted.
 *
 * Note: with a real backend, pair this with server-side checks (middleware reading an
 * httpOnly session cookie) — client guards alone only protect the UI, not the data.
 */
export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSession();

  const isAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role) : false);
  const homeForRole = (role?: UserRole) => (role === "parent" ? routes.parent.root() : routes.dashboard.root());

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`${routes.login()}?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAllowed) {
      router.replace(homeForRole(user?.role));
    }
  }, [isLoading, isAuthenticated, isAllowed, pathname, router, user?.role]);

  if (isLoading || !isAuthenticated || !isAllowed) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
