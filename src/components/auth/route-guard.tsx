"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useSession } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`${routes.login()}?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">You don&rsquo;t have access to this page</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Signed in as {user?.name} ({user?.role.replace("_", " ")}). Contact a platform admin if you believe this is a mistake.
        </p>
        <Button variant="outline" onClick={() => router.replace(routes.dashboard.root())}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
