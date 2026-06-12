"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Banknote,
  BarChart3,
  BookMarked,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Globe,
  GraduationCap,
  IdCard,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  List,
  Mail,
  Megaphone,
  Package,
  Palette,
  PieChart,
  Plug,
  Printer,
  Receipt,
  Settings,
  ShoppingBag,
  Tag,
  Tags,
  TrendingUp,
  UserPlus,
  Users,
  Wand2,
  Zap,
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
  { href: routes.dashboard.priceLists(), label: "Price Lists", icon: Tags, roles: ["platform_admin"] },
  { href: routes.dashboard.lab(), label: "Product Lab", icon: Wand2, roles: ["platform_admin"] },
  { href: routes.dashboard.support(), label: "Support", icon: LifeBuoy, roles: ["platform_admin"] },
  { href: routes.dashboard.marketingEmails(), label: "Mailing List", icon: Mail, roles: ["platform_admin"] },
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
      prefetch={false}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150",
        indent && "ml-3 text-xs",
        isActive
          ? "bg-foreground text-background shadow-[0_1px_4px_oklch(0_0_0/20%)]"
          : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
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
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150",
        "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
        indent && "ml-3 text-xs",
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

function SchoolNav({ schoolId, role, onNavigate }: { schoolId: string; role?: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();

  const onClasses =
    pathname.startsWith(routes.dashboard.schoolClasses(schoolId)) ||
    pathname.startsWith(routes.dashboard.schoolAlbums(schoolId)) ||
    pathname.startsWith(routes.dashboard.schoolTags(schoolId));

  const onReports = pathname.includes(`/schools/${schoolId}/reports`);
  const onSalesOverview = pathname.includes(`/schools/${schoolId}/reports/sales-overview`);
  const onSettings = [
    routes.dashboard.schoolBranding(schoolId),
    routes.dashboard.schoolContent(schoolId),
    routes.dashboard.schoolPricingRules(schoolId),
    routes.dashboard.schoolIntegrations(schoolId),
    routes.dashboard.schoolAiTools(schoolId),
  ].some((r) => pathname.startsWith(r));

  const [classesOpen, setClassesOpen] = useState(onClasses);
  const [reportsOpen, setReportsOpen] = useState(onReports);
  const [salesOverviewOpen, setSalesOverviewOpen] = useState(onSalesOverview);
  const [settingsOpen, setSettingsOpen] = useState(onSettings);

  // Auto-expand when navigating to a child route externally
  useEffect(() => {
    if (onClasses) setClassesOpen(true);
    if (onReports) setReportsOpen(true);
    if (onSalesOverview) setSalesOverviewOpen(true);
    if (onSettings) setSettingsOpen(true);
  }, [onClasses, onReports, onSalesOverview, onSettings]);

  const r = routes.dashboard;

  // School Admin is a view-only role: dashboard, group orders, reports, and invoices only.
  if (role === "school_admin") {
    return (
      <nav className="flex flex-col gap-0.5">
        <Link
          href={routes.dashboard.root()}
          onClick={onNavigate}
          className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-foreground/6 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Overview
        </Link>

        <NavLink href={r.school(schoolId)} label="Dashboard" icon={LayoutDashboard} onNavigate={onNavigate} />
        <NavLink href={r.schoolGroupOrders(schoolId)} label="Group order" icon={ShoppingBag} onNavigate={onNavigate} />

        <div className="my-1.5 h-px bg-border/50" />

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

        <NavLink href={r.schoolInvoices(schoolId)} label="Invoices" icon={Receipt} onNavigate={onNavigate} />
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {/* ← Schools back button */}
      <Link
        href={routes.dashboard.schools()}
        onClick={onNavigate}
        className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-foreground/6 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        All Schools
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

      {/* Approvals */}
      <NavLink href={r.schoolApprovals(schoolId)} label="Approvals" icon={CheckCircle} onNavigate={onNavigate} />

      {/* Print Queue */}
      <NavLink href={r.schoolPrintQueue(schoolId)} label="Print Queue" icon={Printer} onNavigate={onNavigate} />

      {/* Divider */}
      <div className="my-1.5 h-px bg-border/50" />

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

      {/* Divider */}
      <div className="my-1.5 h-px bg-border/50" />

      {/* School Settings (collapsible) */}
      <SectionHeader label="School Settings" icon={Settings} open={settingsOpen} onToggle={() => setSettingsOpen((v) => !v)} />
      {settingsOpen && (
        <div className="flex flex-col gap-0.5">
          <NavLink href={r.schoolBranding(schoolId)} label="Branding" icon={Palette} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolContent(schoolId)} label="Content / CMS" icon={Megaphone} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolPricingRules(schoolId)} label="Pricing Rules" icon={Zap} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolIntegrations(schoolId)} label="Integrations" icon={Plug} indent onNavigate={onNavigate} />
          <NavLink href={r.schoolAiTools(schoolId)} label="AI & Automation" icon={Bot} indent onNavigate={onNavigate} />
        </div>
      )}
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
        <SchoolNav schoolId={schoolId} role={user?.role} onNavigate={onNavigate} />
      </div>
    );
  }

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = href === routes.dashboard.root() ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-foreground text-background shadow-[0_1px_4px_oklch(0_0_0/20%)]"
                : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 glass-navbar p-5 lg:flex">
      <div className="px-1 py-1">
        <Logo />
      </div>
      <div className="mt-6 flex-1 overflow-y-auto">
        <DashboardNav />
      </div>
    </aside>
  );
}
