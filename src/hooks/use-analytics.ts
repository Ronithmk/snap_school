"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.getOverview(),
    staleTime: 2 * 60_000,
  });
}
