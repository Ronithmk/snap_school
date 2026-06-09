"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { OrderStatus } from "@/types";

const AWAITING_STATUSES: OrderStatus[] = ["pending_payment", "paid", "processing"];

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolOrdersAwaitingPage({ params }: Props) {
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

  // Filter client-side to only awaiting statuses when showing all
  const displayData = data?.data.filter((o) =>
    status !== "__all__" ? true : AWAITING_STATUSES.includes(o.status)
  );

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Orders Awaiting</span>
      </nav>

      <PageHeader
        title="Orders Awaiting"
        description="Orders that are pending payment, confirmation, or processing."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders…" className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} containerClassName="sm:w-52">
          <option value="__all__">All awaiting</option>
          {AWAITING_STATUSES.map((v) => (
            <option key={v} value={v}>{ORDER_STATUS_LABELS[v]}</option>
          ))}
        </Select>
      </div>

      {isLoading || !data ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : !displayData || displayData.length === 0 ? (
        <EmptyState icon={Clock} title="No orders awaiting" description="All orders have been processed — nothing requires attention right now." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Album</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={routes.dashboard.order(order.id)} className="font-medium text-sm hover:underline">{order.orderNumber}</Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{order.albumTitle}</TableCell>
                  <TableCell>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell><Badge variant={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge></TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">{formatCurrency(order.totals.total, order.totals.currencyCode)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{new Date(order.placedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.meta.page <= 1}><ChevronLeft className="h-4 w-4" />Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={data.meta.page >= data.meta.totalPages}>Next<ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
