"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services";
import { ORDERS_PAGE_SIZE } from "@/config/constants";
import type { CreateOrderInput, DownloadAssetRequest, OrderListFilters, QueryParams } from "@/types";

/** Places an order at the end of checkout — used by the per-album checkout flow. */
export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.create(input),
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
