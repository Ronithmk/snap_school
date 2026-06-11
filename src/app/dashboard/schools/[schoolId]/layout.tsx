"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useSession } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

/** Sub-routes a `school_admin` (view-only) is allowed to access within their school. */
function isAllowedForSchoolAdmin(pathname: string, schoolId: string): boolean {
  const r = routes.dashboard;
  const allowedPrefixes = [
    r.school(schoolId),
    r.schoolGroupOrders(schoolId),
    `/dashboard/schools/${schoolId}/reports`,
    r.schoolInvoices(schoolId),
  ];
  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function SchoolSectionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const { user, isLoading } = useSession();

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user.role === "school_admin") {
    const ownsSchool = (user.schoolIds ?? []).includes(schoolId);
    const allowed = ownsSchool && isAllowedForSchoolAdmin(pathname, schoolId);

    if (!allowed) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">You don&rsquo;t have access to this page</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            School admins can view their school&rsquo;s dashboard, group orders, reports, and invoices.
          </p>
          <Button variant="outline" onClick={() => router.replace(routes.dashboard.root())}>
            Back to dashboard
          </Button>
        </div>
      );
    }
  }

  return <>{children}</>;
}
