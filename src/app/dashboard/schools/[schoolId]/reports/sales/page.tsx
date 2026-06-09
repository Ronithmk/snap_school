"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { BarChart2, CheckCircle2, Package, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { ORDER_STATUS_LABELS } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

interface Props { params: Promise<{ schoolId: string }> }

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  paid: "#3b82f6",
  processing: "#f59e0b",
  pending_payment: "#94a3b8",
  shipped: "#8b5cf6",
  ready_for_download: "#06b6d4",
  cancelled: "#ef4444",
  refunded: "#f97316",
};

export default function SchoolSalesStatisticsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: ordersPage, isLoading } = useOrders({ schoolId });

  const stats = useMemo(() => {
    if (!ordersPage?.data) return null;
    const orders = ordersPage.data;
    const currency = orders[0]?.totals.currencyCode ?? "USD";

    const completed = orders.filter((o) =>
      ["completed", "paid", "shipped", "ready_for_download"].includes(o.status)
    );
    const totalRevenue = completed.reduce((s, o) => s + o.totals.total, 0);
    const active = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
    const avgOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;
    const completionRate = active.length > 0 ? (completed.length / active.length) * 100 : 0;

    // Last 30 days trend
    const daily: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      daily[key] = { date: key, revenue: 0, orders: 0 };
    }
    for (const o of completed) {
      const key = o.placedAt.slice(0, 10);
      if (daily[key]) { daily[key].revenue += o.totals.total; daily[key].orders += 1; }
    }
    const trendData = Object.values(daily).map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

    // Status breakdown
    const statusMap: Record<string, number> = {};
    for (const o of orders) statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
    const statusData = Object.entries(statusMap).map(([s, count]) => ({
      status: s, label: (ORDER_STATUS_LABELS as Record<string, string>)[s] ?? s, count,
    }));

    return { totalRevenue, orderCount: orders.length, avgOrderValue, completionRate, currency, trendData, statusData };
  }, [ordersPage]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Sales Statistics</span>
      </nav>

      <PageHeader title="Sales Statistics" description="Revenue and order performance for this school." />

      {isLoading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, stats.currency), icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Total Orders", value: stats.orderCount.toString(), icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Avg Order Value", value: formatCurrency(stats.avgOrderValue, stats.currency), icon: BarChart2, color: "text-violet-500", bg: "bg-violet-500/10" },
              { label: "Completion Rate", value: `${stats.completionRate.toFixed(0)}%`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm font-medium">Revenue – Last 30 Days</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      ticks={stats.trendData.filter((_, i) => i % 7 === 0).map((d) => d.label)} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [formatCurrency(v as number, stats.currency), "Revenue"]} labelStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Orders by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.statusData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.statusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
