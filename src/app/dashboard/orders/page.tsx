"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Loader2, Package, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExportOrdersCsv, useOrders } from "@/hooks/use-orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { OrderStatus } from "@/types";

const ALL_STATUSES = "__all__";

export default function DashboardOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL_STATUSES);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrders({
    search: search || undefined,
    status: status === ALL_STATUSES ? undefined : (status as OrderStatus),
    page,
  });
  const exportCsv = useExportOrdersCsv();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track and fulfil photo orders placed across every school."
        actions={
          <Button variant="outline" onClick={() => exportCsv.mutate({ search: search || undefined, status: status === ALL_STATUSES ? undefined : (status as OrderStatus) })} disabled={exportCsv.isPending}>
            {exportCsv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order #, customer, or email…"
            className="pl-9"
            aria-label="Search orders"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          containerClassName="sm:w-56"
          aria-label="Filter by status"
        >
          <option value={ALL_STATUSES}>All statuses</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading || !data ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="Try a different search term or status filter — orders placed by families will show up here."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>School / Album</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((order) => (
                <TableRow key={order.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={routes.dashboard.order(order.id)} className="font-medium text-sm hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="truncate text-sm">{order.schoolName}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.albumTitle}</p>
                  </TableCell>
                  <TableCell>
                    <p className="truncate text-sm">{order.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {formatCurrency(order.totals.total, order.totals.currencyCode)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                    {new Date(order.placedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.meta.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} orders
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.meta.page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={data.meta.page >= data.meta.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
