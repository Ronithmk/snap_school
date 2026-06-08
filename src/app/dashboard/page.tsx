"use client";

import Link from "next/link";
import { BarChart3, ImageIcon, Receipt, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard";
import { useAnalyticsOverview } from "@/hooks/use-analytics";
import { useSession } from "@/hooks/use-auth";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";

export default function DashboardOverviewPage() {
  const { user } = useSession();
  const { data, isLoading } = useAnalyticsOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's how your galleries are performing across all schools."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Revenue" value={formatCurrency(data.summary.totalRevenue, data.summary.currencyCode)} icon={TrendingUp} changePercent={data.summary.revenueChangePercent} />
            <StatCard label="Orders" value={data.summary.totalOrders.toString()} icon={Receipt} changePercent={data.summary.ordersChangePercent} />
            <StatCard label="Conversion rate" value={`${data.summary.conversionRate.toFixed(1)}%`} icon={BarChart3} />
            <StatCard label="Avg. order value" value={formatCurrency(data.summary.averageOrderValue, data.summary.currencyCode)} icon={ImageIcon} />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Popular albums</CardTitle>
            <Link href={routes.dashboard.analytics()} className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading || !data
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : data.popularAlbums.map((album) => (
                  <div key={album.albumId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{album.albumTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{album.schoolName}</p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-medium">{formatCurrency(album.revenue, data.summary.currencyCode)}</p>
                      <p className="text-xs text-muted-foreground">{album.orders} orders</p>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link href={routes.dashboard.orders()} className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading || !data
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={routes.dashboard.order(order.id)}
                    className="flex items-center justify-between gap-3 rounded-lg p-2 -m-2 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.orderNumber} · {order.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.schoolName} — {order.albumTitle}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium">{formatCurrency(order.totals.total, order.totals.currencyCode)}</span>
                      <Badge variant={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </div>
                  </Link>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
