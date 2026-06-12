"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { marketingService } from "@/services";
import type { MarketingCampaignInput, MarketingEmailListFilters } from "@/types";

export function useMarketingEmails(filters: MarketingEmailListFilters = {}) {
  return useQuery({
    queryKey: ["marketing-emails", filters],
    queryFn: () => marketingService.listEmails(filters),
  });
}

export function useExportMarketingEmailsCsv() {
  return useMutation({
    mutationFn: () => marketingService.exportEmailsCsv(),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `marketing-emails-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useSetMarketingOptOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, marketingOptOut }: { userId: string; marketingOptOut: boolean }) =>
      marketingService.setOptOut(userId, marketingOptOut),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-emails"] });
    },
  });
}

export function useMarketingCampaigns() {
  return useQuery({
    queryKey: ["marketing-campaigns"],
    queryFn: () => marketingService.listCampaigns(),
  });
}

export function useSendMarketingCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MarketingCampaignInput) => marketingService.sendCampaign(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
    },
  });
}
