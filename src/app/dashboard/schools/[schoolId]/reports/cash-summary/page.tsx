"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { Banknote, TrendingDown, TrendingUp, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { ORDER_STATUS_LABELS } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolCashSummaryPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: ordersPage, isLoading } = useOrders({ schoolId });

  const summary = useMemo(() => {
    if (!ordersPage?.data) return null;
    const orders = ordersPage.data;
    const currency = orders[0]?.totals.currencyCode ?? "USD";

    const completed = orders.filter((o) => ["completed", "paid", "cod", "shipped", "ready_for_download"].includes(o.status));
    const cancelled = orders.filter((o) => ["cancelled", "refunded"].includes(o.status));

    const subtotal = completed.reduce((s, o) => s + o.totals.subtotal, 0);
    const discounts = completed.reduce((s, o) => s + o.totals.discount, 0);
    const shipping = completed.reduce((s, o) => s + o.totals.shipping, 0);
    const tax = completed.reduce((s, o) => s + o.totals.tax, 0);
    const gross = completed.reduce((s, o) => s + o.totals.total, 0);
    const refunds = cancelled.reduce((s, o) => s + o.totals.total, 0);
    const net = gross - refunds;

    // Per-status breakdown
    const statusMap: Record<string, { count: number; revenue: number }> = {};
    for (const o of orders) {
      if (!statusMap[o.status]) statusMap[o.status] = { count: 0, revenue: 0 };
      statusMap[o.status].count += 1;
      statusMap[o.status].revenue += o.totals.total;
    }
    const statusBreakdown = Object.entries(statusMap)
      .map(([s, v]) => ({ status: s, label: (ORDER_STATUS_LABELS as Record<string, string>)[s] ?? s, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    return { subtotal, discounts, shipping, tax, gross, refunds, net, currency, statusBreakdown, completedCount: completed.length };
  }, [ordersPage]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Summary of Cash</span>
      </nav>

      <PageHeader title="Summary of Cash" description="Financial breakdown of all revenue for this school." />

      {isLoading || !summary ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Gross Revenue", value: formatCurrency(summary.gross, summary.currency), icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Net Revenue", value: formatCurrency(summary.net, summary.currency), icon: Banknote, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Shipping Collected", value: formatCurrency(summary.shipping, summary.currency), icon: Truck, color: "text-violet-500", bg: "bg-violet-500/10" },
              { label: "Total Discounts", value: formatCurrency(summary.discounts, summary.currency), icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Revenue Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Subtotal (products)", value: summary.subtotal, positive: true },
                    { label: "Shipping", value: summary.shipping, positive: true },
                    { label: "Tax collected", value: summary.tax, positive: true },
                    { label: "Discounts applied", value: -summary.discounts, positive: false },
                    { label: "Refunds / cancellations", value: -summary.refunds, positive: false },
                  ].map(({ label, value, positive }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className={`text-sm font-medium tabular-nums ${!positive && value < 0 ? "text-destructive" : ""}`}>
                        {value < 0 ? `−${formatCurrency(-value, summary.currency)}` : formatCurrency(value, summary.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Net Revenue</span>
                    <span className="text-sm font-bold tabular-nums">{formatCurrency(summary.net, summary.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Revenue by Order Status</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.statusBreakdown.map((row) => (
                      <TableRow key={row.status}>
                        <TableCell className="text-sm">{row.label}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{row.count}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{formatCurrency(row.revenue, summary.currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
