"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, FileBarChart, Loader2, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders, useExportOrdersCsv } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { OrderStatus } from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolSalesReportPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("__all__");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrders({
    schoolId,
    search: search || undefined,
    status: status === "__all__" ? undefined : (status as OrderStatus),
    page,
  });

  const exportCsv = useExportOrdersCsv();
  const pageRevenue = data?.data.reduce((s, o) =>
    s + (o.status !== "cancelled" && o.status !== "refunded" ? o.totals.total : 0), 0) ?? 0;
  const currency = data?.data[0]?.totals.currencyCode ?? "USD";

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Sales Report</span>
      </nav>

      <PageHeader
        title="Sales Report"
        description="Detailed order report with financial breakdown."
        actions={
          <Button variant="outline"
            onClick={() => exportCsv.mutate({ schoolId, search: search || undefined, status: status === "__all__" ? undefined : (status as OrderStatus) })}
            disabled={exportCsv.isPending}>
            {exportCsv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Order #, customer or email…" className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} containerClassName="sm:w-52">
          <option value="__all__">All statuses</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((v) => (
            <option key={v} value={v}>{ORDER_STATUS_LABELS[v]}</option>
          ))}
        </Select>
      </div>

      {isLoading || !data ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : data.data.length === 0 ? (
        <EmptyState icon={FileBarChart} title="No sales data" description="No orders match your current filter." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Album</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Shipping</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={routes.dashboard.order(order.id)} className="font-mono text-xs font-medium hover:underline">{order.orderNumber}</Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">{order.albumTitle}</TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS_TONE[order.status]} className="text-xs">{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{formatCurrency(order.totals.subtotal, order.totals.currencyCode)}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-destructive">
                    {order.totals.discount > 0 ? `−${formatCurrency(order.totals.discount, order.totals.currencyCode)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {order.totals.shipping > 0 ? formatCurrency(order.totals.shipping, order.totals.currencyCode) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold tabular-nums">{formatCurrency(order.totals.total, order.totals.currencyCode)}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(order.placedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
            <p className="text-sm text-muted-foreground">Page revenue (excl. cancelled/refunded)</p>
            <p className="font-semibold tabular-nums">{formatCurrency(pageRevenue, currency)}</p>
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} orders</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.meta.page <= 1}><ChevronLeft className="h-4 w-4" />Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} disabled={data.meta.page >= data.meta.totalPages}>Next<ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
