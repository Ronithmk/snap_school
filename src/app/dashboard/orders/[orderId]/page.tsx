"use client";

import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronRight, Download, FileText, Loader2, Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder, useRequestDownload, downloadOrderAsset } from "@/hooks/use-orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { ApiError, DownloadAssetType } from "@/types";

const DOWNLOAD_ASSETS: { type: DownloadAssetType; label: string; icon: typeof FileText }[] = [
  { type: "jpg", label: "Original JPGs", icon: Download },
  { type: "pdf_contact_sheet", label: "Invoice (PDF)", icon: FileText },
  { type: "zip_package", label: "Full package (ZIP)", icon: Package },
];

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = use(params);
  const { data: order, isLoading } = useOrder(orderId);
  const requestDownload = useRequestDownload();

  async function handleDownload(assetType: DownloadAssetType) {
    try {
      const blob = await requestDownload.mutateAsync({ orderId, assetType });
      downloadOrderAsset(blob, assetType, order!.orderNumber);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't generate the download. Please try again.");
    }
  }

  if (isLoading || !order) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.orders()} className="transition-colors hover:text-foreground">
          Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{order.orderNumber}</span>
      </nav>

      <PageHeader
        title={order.orderNumber}
        description={`Placed ${new Date(order.placedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} · ${order.schoolName} · ${order.albumTitle}`}
        actions={<Badge variant={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-sm font-semibold">Items ({itemCount})</h2>
              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbnailUrl} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice, order.totals.currencyCode)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {formatCurrency(item.unitPrice * item.quantity, order.totals.currencyCode)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-sm font-semibold">Downloads</h2>
              <p className="text-sm text-muted-foreground">Generate fulfilment assets for this order.</p>
              <div className="flex flex-wrap gap-2">
                {DOWNLOAD_ASSETS.map(({ type, label, icon: Icon }) => (
                  <Button key={type} variant="outline" size="sm" onClick={() => handleDownload(type)} disabled={requestDownload.isPending}>
                    {requestDownload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-sm font-semibold">Customer</h2>
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
              </div>
              {order.shippingAddress ? (
                <>
                  <Separator />
                  <div className="space-y-0.5 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Shipping address</p>
                    <p>{order.shippingAddress.fullName}</p>
                    <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 ? <p className="text-muted-foreground">{order.shippingAddress.line2}</p> : null}
                    <p className="text-muted-foreground">
                      {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-muted-foreground">{order.shippingAddress.countryCode}</p>
                    {order.shippingAddress.phone ? <p className="text-muted-foreground">{order.shippingAddress.phone}</p> : null}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Order total</h2>
              <dl className="space-y-2.5 text-sm">
                <Row label="Subtotal" value={formatCurrency(order.totals.subtotal, order.totals.currencyCode)} />
                {order.totals.discount > 0 ? (
                  <Row label="Discount" value={`− ${formatCurrency(order.totals.discount, order.totals.currencyCode)}`} tone="positive" />
                ) : null}
                <Row label="Shipping" value={order.totals.shipping > 0 ? formatCurrency(order.totals.shipping, order.totals.currencyCode) : "Free"} />
                {order.totals.tax > 0 ? <Row label="Tax" value={formatCurrency(order.totals.tax, order.totals.currencyCode)} /> : null}
              </dl>
              <Separator className="my-3" />
              <div className="flex items-baseline justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.totals.total, order.totals.currencyCode)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : undefined}>{value}</dd>
    </div>
  );
}
