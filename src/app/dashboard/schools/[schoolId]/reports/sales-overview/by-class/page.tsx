"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { BarChart2, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useSchoolClasses } from "@/hooks/use-albums";
import { useSchool } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolSalesByClassPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: ordersPage, isLoading: ordersLoading } = useOrders({ schoolId });
  const { data: classes, isLoading: classesLoading } = useSchoolClasses(schoolId);

  const grouped = useMemo(() => {
    if (!ordersPage?.data || !classes) return null;
    const orders = ordersPage.data;
    const currency = orders[0]?.totals.currencyCode ?? "USD";

    // Group orders by albumTitle as proxy for class grouping
    const albumMap: Record<string, { title: string; revenue: number; orders: number; completedOrders: number }> = {};
    for (const o of orders) {
      const key = o.albumId ?? o.albumTitle;
      if (!albumMap[key]) albumMap[key] = { title: o.albumTitle, revenue: 0, orders: 0, completedOrders: 0 };
      albumMap[key].orders += 1;
      if (["completed", "paid", "shipped", "ready_for_download"].includes(o.status)) {
        albumMap[key].revenue += o.totals.total;
        albumMap[key].completedOrders += 1;
      }
    }

    const rows = Object.entries(albumMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    const chartData = rows.slice(0, 8).map((r) => ({
      name: r.title.length > 14 ? r.title.slice(0, 14) + "…" : r.title,
      revenue: r.revenue,
    }));

    return { rows, chartData, currency };
  }, [ordersPage, classes]);

  const isLoading = ordersLoading || classesLoading;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Sales by Class</span>
      </nav>

      <PageHeader title="Sales by Class" description="Revenue and order counts grouped by album / class." />

      {isLoading || !grouped ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : grouped.rows.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No sales data" description="No orders have been placed for this school yet." />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Revenue by Album</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={grouped.chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [formatCurrency(v as number, grouped.currency), "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {grouped.chartData.map((_, i) => (
                      <Cell key={i} fillOpacity={1 - i * 0.07} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Album</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.rows.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell className="text-muted-foreground tabular-nums text-sm">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <BarChart2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{row.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{row.orders}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-green-600">{row.completedOrders}</TableCell>
                  <TableCell className="text-right text-sm font-semibold tabular-nums">{formatCurrency(row.revenue, grouped.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
