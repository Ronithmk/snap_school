import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import { MOCK_PRICE_LISTS } from "@/services/mock/seed-data";
import type { CreatePriceListInput, PriceList, UpdatePriceListInput } from "@/types";

const ENDPOINTS = {
  list: "/price-lists",
  byId: (id: string) => `/price-lists/${id}`,
} as const;

let mockPriceLists = [...MOCK_PRICE_LISTS];

export const pricingService = {
  /** All price lists for a given school. */
  async listBySchool(schoolId: string): Promise<PriceList[]> {
    if (env.useMockApi) return mockDelay(mockPriceLists.filter((p) => p.schoolId === schoolId));
    const { data } = await apiClient.get<PriceList[]>(ENDPOINTS.list, { params: { schoolId } });
    return data;
  },

  /** The default price list for a given school (first one marked isDefault). */
  async getDefaultForSchool(schoolId: string): Promise<PriceList | null> {
    if (env.useMockApi) {
      return mockDelay(
        mockPriceLists.find((p) => p.schoolId === schoolId && p.isDefault) ??
          mockPriceLists.find((p) => p.schoolId === schoolId) ??
          null,
      );
    }
    const { data } = await apiClient.get<PriceList | null>(`${ENDPOINTS.list}/default`, { params: { schoolId } });
    return data;
  },

  async create(input: CreatePriceListInput): Promise<PriceList> {
    if (env.useMockApi) {
      const priceList: PriceList = {
        id: `pl_${Date.now()}`,
        isDefault: false,
        updatedAt: new Date().toISOString(),
        ...input,
        items: input.items.map((item, i) => ({ id: `pli_${Date.now()}_${i}`, ...item })),
        bulkDiscounts: input.bulkDiscounts.map((tier, i) => ({ id: `bd_${Date.now()}_${i}`, ...tier })),
      };
      mockPriceLists = [priceList, ...mockPriceLists];
      return mockDelay(priceList);
    }
    const { data } = await apiClient.post<PriceList>(ENDPOINTS.list, input);
    return data;
  },

  async update(id: string, input: UpdatePriceListInput): Promise<PriceList> {
    if (env.useMockApi) {
      const existing = mockPriceLists.find((p) => p.id === id);
      if (!existing) throw new Error("Price list not found");
      const updated: PriceList = { ...existing, ...input, updatedAt: new Date().toISOString() } as PriceList;
      mockPriceLists = mockPriceLists.map((p) => (p.id === id ? updated : p));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<PriceList>(ENDPOINTS.byId(id), input);
    return data;
  },
};
