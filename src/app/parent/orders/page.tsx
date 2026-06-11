"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParentOrders } from "@/hooks/use-parent";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";

export default function ParentOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useParentOrders({ page });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="My orders" description="Track the status of prints and downloads you've ordered." />

      {isLoading || !data ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Orders you place from your child's album will show up here."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>School / Album</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-sm">{order.orderNumber}</TableCell>
                  <TableCell>
                    <p className="truncate text-sm">{order.schoolName}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.albumTitle}</p>
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
