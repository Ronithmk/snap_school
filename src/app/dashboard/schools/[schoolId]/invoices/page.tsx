"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders, useExportOrdersCsv, useRequestDownload, downloadOrderAsset } from "@/hooks/use-orders";
import { useSchool } from "@/hooks/use-tenant";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolInvoicesPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Invoices = paid or COD orders that are confirmed and ready to fulfill
  const { data, isLoading } = useOrders({ schoolId, status: "paid,cod", search: search || undefined, page });
  const exportCsv = useExportOrdersCsv();
  const requestDownload = useRequestDownload();

  const invoices = data?.data ?? [];

  async function handleDownloadInvoice(orderId: string, orderNumber: string) {
    try {
      const blob = await requestDownload.mutateAsync({ orderId, assetType: "pdf_contact_sheet" });
      downloadOrderAsset(blob, "pdf_contact_sheet", orderNumber);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't generate the invoice. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Invoices</span>
      </nav>

      <PageHeader
        title="Invoices"
        description="Paid orders issued as invoices for this school."
        actions={
          <Button variant="outline" onClick={() => exportCsv.mutate({ schoolId, status: "paid,cod" })} disabled={exportCsv.isPending}>
            {exportCsv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        }
      />

      <div className="relative sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search invoices…" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices yet" description="Invoices appear here once a customer pays online or places a cash-on-delivery order." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Album</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-medium">{order.orderNumber}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">{order.albumTitle}</TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS_TONE[order.status]} className="text-xs">{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold tabular-nums">{formatCurrency(order.totals.total, order.totals.currencyCode)}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(order.placedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        disabled={requestDownload.isPending}
                        onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                      >
                        {requestDownload.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                        Invoice
                      </Button>
                      <Link href={routes.dashboard.order(order.id)} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">View</Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data && data.meta.totalPages > 1 && (
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
