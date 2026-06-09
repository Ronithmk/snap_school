"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, FolderOpen, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolGroupOrdersPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: ordersPage, isLoading } = useOrders({ schoolId });
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    if (!ordersPage?.data) return [];
    const orders = ordersPage.data.filter((o) =>
      !search || o.albumTitle.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
    );

    const map: Record<string, { albumId: string; albumTitle: string; orders: typeof orders; revenue: number }> = {};
    for (const o of orders) {
      const key = o.albumId ?? o.albumTitle;
      if (!map[key]) map[key] = { albumId: key, albumTitle: o.albumTitle, orders: [], revenue: 0 };
      map[key].orders.push(o);
      if (!["cancelled", "refunded"].includes(o.status)) map[key].revenue += o.totals.total;
    }

    return Object.values(map).sort((a, b) => b.orders.length - a.orders.length);
  }, [ordersPage, search]);

  const currency = ordersPage?.data[0]?.totals.currencyCode ?? "USD";

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Group Orders</span>
      </nav>

      <PageHeader title="Group Orders" description="Orders grouped by album — useful for batch processing." />

      <div className="relative sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search albums or customers…" className="pl-9" />
      </div>

      {isLoading || !ordersPage ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : groups.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No orders found" description="No orders have been placed for this school yet." />
      ) : (
        <div className="space-y-2">
          {groups.map((group) => {
            const open = expanded.has(group.albumId);
            return (
              <div key={group.albumId} className="overflow-hidden rounded-xl border">
                <button
                  type="button"
                  onClick={() => toggle(group.albumId)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{group.albumTitle}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="text-xs">{group.orders.length} orders</Badge>
                    <span className="text-sm font-semibold tabular-nums">{formatCurrency(group.revenue, currency)}</span>
                  </div>
                </button>

                {open && (
                  <div className="border-t">
                    {group.orders.map((order) => (
                      <div key={order.id} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
                        <div className="w-4" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={routes.dashboard.order(order.id)} className="font-mono text-xs font-medium hover:underline">{order.orderNumber}</Link>
                            <span className="text-sm">{order.customerName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant={ORDER_STATUS_TONE[order.status]} className="text-xs">{ORDER_STATUS_LABELS[order.status]}</Badge>
                          <span className="text-sm tabular-nums">{formatCurrency(order.totals.total, order.totals.currencyCode)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
