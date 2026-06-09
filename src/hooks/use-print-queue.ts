"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type { PrintJob } from "@/app/api/schools/[schoolId]/print-queue/route";

export type { PrintJob };

export interface PrintQueueStats {
  pending: number;
  printing: number;
  completed: number;
}

export interface PrintQueueResponse {
  jobs: PrintJob[];
  stats: PrintQueueStats;
}

interface PrintQueueFilters {
  status?: string;
  size?: string;
  search?: string;
}

export function usePrintQueue(schoolId: string, filters: PrintQueueFilters = {}) {
  return useQuery({
    queryKey: ["print-queue", schoolId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.size) params.set("size", filters.size);
      if (filters.search) params.set("search", filters.search);
      const { data } = await apiClient.get<PrintQueueResponse>(
        `/schools/${schoolId}/print-queue?${params}`,
      );
      return data;
    },
    staleTime: 30_000,
  });
}

export function useUpdatePrintStatus(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderIds, status }: { orderIds: string[]; status: string }) => {
      const { data } = await apiClient.patch(`/schools/${schoolId}/print-queue/update-status`, {
        orderIds,
        status,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["print-queue", schoolId] }),
  });
}

export function useGenerateZip(schoolId: string) {
  const token = useAuthStore((s) => s.session?.token);

  return useMutation({
    mutationFn: async ({
      orderIds,
      sizeGroup,
      onProgress,
    }: {
      orderIds?: string[];
      sizeGroup?: string;
      onProgress?: (pct: number) => void;
    }) => {
      const res = await fetch(`/api/schools/${schoolId}/print-queue/generate-zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderIds, sizeGroup, markProcessing: true }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to generate ZIP.");
      }

      const contentLength = Number(res.headers.get("Content-Length") ?? 0);
      const reader = res.body!.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) onProgress?.(received / contentLength);
      }

      const blob = new Blob(chunks, { type: "application/zip" });
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "print-queue.zip";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      return filename;
    },
  });
}
