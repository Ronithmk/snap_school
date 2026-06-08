import { RouteGuard } from "@/components/auth/route-guard";

export default function DashboardSchoolsLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={["platform_admin"]}>{children}</RouteGuard>;
}
