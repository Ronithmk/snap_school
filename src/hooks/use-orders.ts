"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ordersService, paymentsService } from "@/services";
import { ORDERS_PAGE_SIZE } from "@/config/constants";
import type { CreateOrderInput, DownloadAssetRequest, OrderListFilters, QueryParams, VerifyPaymentInput } from "@/types";

/** Places a cash-on-delivery order at the end of checkout — used by the per-album checkout flow. */
export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.create(input),
  });
}

/** Creates a pending order + Razorpay order for the "Pay online" checkout flow. */
export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => paymentsService.createRazorpayOrder(input),
  });
}

/** Verifies a completed Razorpay payment and marks the order as paid. */
export function useVerifyPayment() {
  return useMutation({
    mutationFn: (input: VerifyPaymentInput) => paymentsService.verifyPayment(input),
  });
}

export function useOrders(filters: OrderListFilters & QueryParams = {}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => ordersService.list({ pageSize: ORDERS_PAGE_SIZE, ...filters }),
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersService.getById(orderId!),
    enabled: !!orderId,
  });
}

export function useRequestDownload() {
  return useMutation({
    mutationFn: (request: DownloadAssetRequest) => ordersService.requestDownload(request),
  });
}

const DOWNLOAD_EXTENSIONS: Record<DownloadAssetRequest["assetType"], string> = {
  jpg: "zip",
  pdf_contact_sheet: "pdf",
  zip_package: "zip",
};

const DOWNLOAD_PREFIXES: Record<DownloadAssetRequest["assetType"], string> = {
  jpg: "photos",
  pdf_contact_sheet: "invoice",
  zip_package: "order",
};

/** Triggers a browser download for the given order asset, naming the file after the order number. */
export function downloadOrderAsset(blob: Blob, assetType: DownloadAssetRequest["assetType"], orderNumber: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${DOWNLOAD_PREFIXES[assetType]}-${orderNumber}.${DOWNLOAD_EXTENSIONS[assetType]}`;
  link.click();
  URL.revokeObjectURL(url);
}

export function useExportOrdersCsv() {
  return useMutation({
    mutationFn: (filters: OrderListFilters = {}) => ordersService.exportCsv(filters),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}
