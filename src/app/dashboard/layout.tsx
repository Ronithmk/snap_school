import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardSidebar, DashboardTopbar } from "@/components/dashboard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardTopbar title="Dashboard" />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
