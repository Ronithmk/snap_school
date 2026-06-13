import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardSidebar, DashboardTopbar } from "@/components/dashboard";
import { ScenicBackground } from "@/components/shared/scenic-background";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardTopbar title="Dashboard" />
          <main className="bg-gradient-luxury relative flex-1 overflow-hidden p-4 sm:p-6">
            <ScenicBackground />
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
