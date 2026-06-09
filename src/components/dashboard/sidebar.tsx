"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Banknote,
  BarChart3,
  BookMarked,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  GraduationCap,
  IdCard,
  Images,
  LayoutDashboard,
  LayoutGrid,
  List,
  Package,
  PieChart,
  Receipt,
  Settings,
  ShoppingBag,
  Tag,
  Tags,
  TrendingUp,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useSession } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ── Global nav (non-school context) ──────────────────────────────

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
  { href: routes.dashboard.schools(), label: "Schools", icon: LayoutGrid, roles: ["platform_admin"] },
  { href: routes.dashboard.priceLists(), label: "Price Lists", icon: Tags },
  { href: routes.dashboard.lab(), label: "Product Lab", icon: Wand2 },
  { href: routes.dashboard.settings(), label: "Settings", icon: Settings },
];

// ── School nav item helpers ───────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  indent = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  indent?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== routes.dashboard.root() && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        indent && "ml-4 text-xs",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className={cn("shrink-0", indent ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SectionHeader({
  label,
  icon: Icon,
  open,
  onToggle,
  indent = false,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  open: boolean;
  onToggle: () => void;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        indent && "ml-4 text-xs",
      )}
    >
      <Icon className={cn("shrink-0", indent ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span className="flex-1 truncate text-left">{label}</span>
      {open ? (
        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      )}
    </button>
  );
}

// ── School-context nav ────────────────────────────────────────────

function SchoolNav({ schoolId, onNavigate }: { schoolId: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  const onClasses =
    pathname.startsWith(routes.dashboard.schoolClasses(schoolId)) ||
    pathname.startsWith(routes.dashboard.schoolAlbums(schoolId)) ||
    pathname.startsWith(routes.dashboard.schoolTags(schoolId));

  const onReports = pathname.includes(`/schools/${schoolId}/reports`);
  const onSalesOverview = pathname.includes(`/schools/${schoolId}/reports/sales-overview`);

  const [classesOpen, setClassesOpen] = useState(onClasses);
  const [reportsOpen, setReportsOpen] = useState(onReports);
  const [salesOverviewOpen, setSalesOverviewOpen] = useState(onSalesOverview);

  // Auto-expand when navigating to a child route externally
  useEffect(() => {
    if (onClasses) setClassesOpen(true);
    if (onReports) setReportsOpen(true);
    if (onSalesOverview) setSalesOverviewOpen(true);
  }, [onClasses, onReports, onSalesOverview]);

  const r = routes.dashboard;

  return (
    <nav className="flex flex-col gap-0.5">
      {/* ← Schools back button */}
      <Link
        href={routes.dashboard.schools()}
        onClick={onNavigate}
        className="mb-2 flex items-center gap-2 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Schools
      </Link>

      {/* Dashboard */}
      <NavLink href={r.school(schoolId)} label="Dashboard" icon={LayoutDashboard} onNavigate={onNavigate} />

      {/* Classes (collapsible) */}
      <SectionHeader
        label="Classes"
        icon={GraduationCap}
        open={classesOpen}
        onToggle={() => setClassesOpen((v) => !v)}
      />
      {classesOpen && (
        <div className="flex flex-col gap-0.5">
          <NavLink href={r.schoolClasses(schoolId)} label="List of classes" icon={List} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolAlbums(schoolId)} label="Albums" icon={Images} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolTags(schoolId)} label="Tags" icon={Tag} indent onNavigate={onNavigate} />
        </div>
      )}

      {/* Price lists */}
      <NavLink href={r.schoolPriceLists(schoolId)} label="Price lists" icon={Tags} onNavigate={onNavigate} />

      {/* Product Library */}
      <NavLink href={r.schoolProductLibrary(schoolId)} label="Product Library" icon={Package} onNavigate={onNavigate} />

      {/* Catalogue */}
      <NavLink href={r.schoolCatalogue(schoolId)} label="Catalogue" icon={BookMarked} onNavigate={onNavigate} />

      {/* Access cards */}
      <NavLink href={r.accessCards(schoolId)} label="Access cards" icon={IdCard} onNavigate={onNavigate} />

      {/* Group order */}
      <NavLink href={r.schoolGroupOrders(schoolId)} label="Group order" icon={ShoppingBag} onNavigate={onNavigate} />

      {/* Parental connection */}
      <NavLink href={r.schoolParentalConnections(schoolId)} label="Parental connection" icon={UserPlus} onNavigate={onNavigate} />

      {/* Divider */}
      <div className="my-1 h-px bg-border" />

      {/* Reports (collapsible) */}
      <SectionHeader
        label="Reports"
        icon={BarChart3}
        open={reportsOpen}
        onToggle={() => setReportsOpen((v) => !v)}
      />
      {reportsOpen && (
        <div className="flex flex-col gap-0.5">
          <NavLink href={r.schoolReportOrders(schoolId)} label="Order history" icon={ClipboardList} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolReportSales(schoolId)} label="Sales statistics" icon={TrendingUp} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolReportSalesReport(schoolId)} label="Sales report" icon={Receipt} indent onNavigate={onNavigate} />

          {/* Sales overview (sub-collapsible) */}
          <SectionHeader
            label="Sales overview"
            icon={PieChart}
            open={salesOverviewOpen}
            onToggle={() => setSalesOverviewOpen((v) => !v)}
            indent
          />
          {salesOverviewOpen && (
            <div className="flex flex-col gap-0.5 ml-4">
              <NavLink href={r.schoolReportSalesOverviewByClass(schoolId)} label="View by class" icon={LayoutGrid} indent onNavigate={onNavigate} />
              <NavLink href={r.schoolReportSalesOverviewStudents(schoolId)} label="Student view" icon={Users} indent onNavigate={onNavigate} />
            </div>
          )}

          <NavLink href={r.schoolReportOrdersAwaiting(schoolId)} label="Orders awaiting" icon={Clock} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolReportCashSummary(schoolId)} label="Summary of cash" icon={Banknote} indent onNavigate={onNavigate} />
        </div>
      )}

      {/* Invoices */}
      <NavLink href={r.schoolInvoices(schoolId)} label="Invoices" icon={Receipt} onNavigate={onNavigate} />
    </nav>
  );
}

// ── Global nav ────────────────────────────────────────────────────

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function DashboardNav({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useSession();

  // Detect school context: extract schoolId from /dashboard/schools/[schoolId]/...
  const schoolMatch = pathname.match(/\/dashboard\/schools\/([^/]+)/);
  const schoolId = schoolMatch?.[1];

  if (schoolId) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <SchoolNav schoolId={schoolId} onNavigate={onNavigate} />
      </div>
    );
  }

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
      <div className="mt-6 overflow-y-auto flex-1">
        <DashboardNav />
      </div>
    </aside>
  );
}
