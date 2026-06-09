"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Receipt, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/dashboard";
import { useAnalyticsOverview } from "@/hooks/use-analytics";
import { formatCurrency } from "@/config/currency";

export default function DashboardAnalyticsPage() {
  const { data, isLoading } = useAnalyticsOverview();
  const currencyCode = data?.summary.currencyCode ?? "USD";

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Revenue, orders, and sales trends across every school on the platform." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Revenue" value={formatCurrency(data.summary.totalRevenue, currencyCode)} icon={TrendingUp} changePercent={data.summary.revenueChangePercent} />
            <StatCard label="Orders" value={data.summary.totalOrders.toString()} icon={Receipt} changePercent={data.summary.ordersChangePercent} />
            <StatCard label="Conversion rate" value={`${data.summary.conversionRate.toFixed(1)}%`} icon={BarChart3} />
            <StatCard label="Countries reached" value={data.countrySales.length.toString()} icon={Users} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-72 w-full" />
          ) : data.revenueSeries.length === 0 ? (
            <EmptyState title="No revenue data yet" description="Revenue trends will appear here once orders start coming in." />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueSeries} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(value: number) => formatCurrency(value, currencyCode)} className="text-xs fill-muted-foreground" />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [name === "revenue" ? formatCurrency(value, currencyCode) : value, name === "revenue" ? "Revenue" : "Orders"] as any}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(value: any) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)", color: "var(--color-popover-foreground)" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales by country</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data.countrySales.length === 0 ? (
            <EmptyState title="No sales yet" description="Country-level sales breakdowns will show up here once orders are placed." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.countrySales.map((country) => (
                  <TableRow key={country.countryCode}>
                    <TableCell className="font-medium">{country.countryName}</TableCell>
                    <TableCell className="text-right">{country.orders}</TableCell>
                    <TableCell className="text-right">{formatCurrency(country.revenue, currencyCode)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
