"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { cacheService } from "@/services";

export function useCacheNamespaces() {
  return useQuery({
    queryKey: ["admin-cache", "namespaces"],
    queryFn: () => cacheService.listNamespaces(),
  });
}

export function useClearCache() {
  return useMutation({
    mutationFn: (tag?: string) => cacheService.clear(tag),
  });
}
