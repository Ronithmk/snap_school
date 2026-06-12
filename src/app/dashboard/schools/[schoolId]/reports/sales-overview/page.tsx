"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { BarChart2, DollarSign, Package, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolSalesOverviewPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: ordersPage, isLoading } = useOrders({ schoolId });

  const stats = useMemo(() => {
    if (!ordersPage?.data) return null;
    const orders = ordersPage.data;
    const currency = orders[0]?.totals.currencyCode ?? "USD";

    const completed = orders.filter((o) => ["completed", "paid", "cod", "shipped", "ready_for_download"].includes(o.status));
    const totalRevenue = completed.reduce((s, o) => s + o.totals.total, 0);
    const avgOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;

    // Top albums by revenue
    const albumMap: Record<string, { title: string; revenue: number; orders: number }> = {};
    for (const o of completed) {
      const key = o.albumId ?? o.albumTitle;
      if (!albumMap[key]) albumMap[key] = { title: o.albumTitle, revenue: 0, orders: 0 };
      albumMap[key].revenue += o.totals.total;
      albumMap[key].orders += 1;
    }
    const topAlbums = Object.entries(albumMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 30-day trend
    const daily: Record<string, { label: string; revenue: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      daily[key] = { label: new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue: 0 };
    }
    for (const o of completed) {
      const key = o.placedAt.slice(0, 10);
      if (daily[key]) daily[key].revenue += o.totals.total;
    }
    const trendData = Object.values(daily);

    return { totalRevenue, orderCount: orders.length, avgOrderValue, currency, topAlbums, trendData };
  }, [ordersPage]);

  const summaryCards = stats ? [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, stats.currency), icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Orders", value: stats.orderCount.toString(), icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Avg Order Value", value: formatCurrency(stats.avgOrderValue, stats.currency), icon: BarChart2, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Active Albums", value: stats.topAlbums.length.toString(), icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ] : [];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Sales Overview</span>
      </nav>

      <PageHeader title="Sales Overview" description="High-level sales breakdown for this school." />

      {isLoading || !stats ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
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
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      ticks={stats.trendData.filter((_, i) => i % 7 === 0).map((d) => d.label)} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [formatCurrency(v as number, stats.currency), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#ovGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Top Albums by Revenue</CardTitle></CardHeader>
              <CardContent>
                {stats.topAlbums.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No completed orders yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Album</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topAlbums.map((album) => (
                        <TableRow key={album.id}>
                          <TableCell className="text-sm">
                            <p className="truncate max-w-[120px]">{album.title}</p>
                            <p className="text-xs text-muted-foreground">{album.orders} orders</p>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium tabular-nums">
                            {formatCurrency(album.revenue, stats.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
