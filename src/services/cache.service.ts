import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import type { CacheNamespace } from "@/types";

const ENDPOINTS = { cache: "/admin/cache" } as const;

export const cacheService = {
  async listNamespaces(): Promise<CacheNamespace[]> {
    if (env.useMockApi) return mockDelay([]);
    const { data } = await apiClient.get<CacheNamespace[]>(ENDPOINTS.cache);
    return data;
  },

  async clear(tag?: string): Promise<{ cleared: string[] }> {
    if (env.useMockApi) return mockDelay({ cleared: tag ? [tag] : [] });
    const { data } = await apiClient.post<{ cleared: string[] }>(ENDPOINTS.cache, tag ? { tag } : {});
    return data;
  },
};
