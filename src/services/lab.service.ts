import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, mockReject, paginate, searchFilter } from "@/services/mock/transport";
import { MOCK_LAB_PRODUCTS } from "@/services/mock/lab";
import type {
  CreateLabProductInput,
  LabExportFormat,
  LabPage,
  LabProduct,
  LabProductListFilters,
  PaginatedResponse,
  QueryParams,
  UpdateLabProductInput,
} from "@/types";

const ENDPOINTS = {
  list: "/lab/products",
  byId: (id: string) => `/lab/products/${id}`,
  duplicate: (id: string) => `/lab/products/${id}/duplicate`,
  export: (id: string) => `/lab/products/${id}/export`,
} as const;

let mockLabProducts = [...MOCK_LAB_PRODUCTS];

function clonePages(pages: LabPage[]): LabPage[] {
  return pages.map((page) => ({ ...page, elements: page.elements.map((el) => ({ ...el })) }));
}

export const labService = {
  /** Lists products scoped to a single school — labs never mix data across tenants. */
  async listBySchool(schoolId: string, filters: LabProductListFilters & QueryParams = {}): Promise<PaginatedResponse<LabProduct>> {
    if (env.useMockApi) {
      let items = mockLabProducts.filter((p) => p.schoolId === schoolId);
      if (filters.status) items = items.filter((p) => p.status === filters.status);
      if (filters.category) items = items.filter((p) => p.category === filters.category);
      if (filters.type) items = items.filter((p) => p.type === filters.type);
      items = searchFilter(items, filters.search, ["name", "description", "category"]);
      items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      return mockDelay(paginate(items, filters));
    }
    const { data } = await apiClient.get<PaginatedResponse<LabProduct>>(ENDPOINTS.list, { params: { schoolId, ...filters } });
    return data;
  },

  /** Published products available platform-wide for the price list catalogue picker. */
  async listPublished(): Promise<LabProduct[]> {
    if (env.useMockApi) {
      return mockDelay(mockLabProducts.filter((p) => p.status === "published"));
    }
    const { data } = await apiClient.get<LabProduct[]>(ENDPOINTS.list, { params: { status: "published" } });
    return data;
  },

  async getById(id: string): Promise<LabProduct | null> {
    if (env.useMockApi) {
      return mockDelay(mockLabProducts.find((p) => p.id === id) ?? null);
    }
    const { data } = await apiClient.get<LabProduct>(ENDPOINTS.byId(id));
    return data;
  },

  async create(schoolId: string, input: CreateLabProductInput): Promise<LabProduct> {
    if (env.useMockApi) {
      const now = new Date().toISOString();
      const product: LabProduct = {
        id: `lab_${Date.now()}`,
        schoolId,
        status: "draft",
        previewImageUrl: "",
        pages: [
          {
            id: "pg_1",
            name: "Page 1",
            widthCm: input.dimensions.widthCm,
            heightCm: input.dimensions.heightCm,
            backgroundColor: "#ffffff",
            elements: [],
          },
        ],
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      mockLabProducts = [product, ...mockLabProducts];
      return mockDelay(product);
    }
    const { data } = await apiClient.post<LabProduct>(ENDPOINTS.list, { schoolId, ...input });
    return data;
  },

  async update(id: string, input: UpdateLabProductInput): Promise<LabProduct> {
    if (env.useMockApi) {
      const existing = mockLabProducts.find((p) => p.id === id);
      if (!existing) return mockReject("Product not found.", 404, "not_found");
      const updated: LabProduct = { ...existing, ...input, updatedAt: new Date().toISOString() };
      mockLabProducts = mockLabProducts.map((p) => (p.id === id ? updated : p));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<LabProduct>(ENDPOINTS.byId(id), input);
    return data;
  },

  async duplicate(id: string): Promise<LabProduct> {
    if (env.useMockApi) {
      const existing = mockLabProducts.find((p) => p.id === id);
      if (!existing) return mockReject("Product not found.", 404, "not_found");
      const now = new Date().toISOString();
      const copy: LabProduct = {
        ...existing,
        id: `lab_${Date.now()}`,
        name: `${existing.name} (copy)`,
        status: "draft",
        pages: clonePages(existing.pages),
        createdAt: now,
        updatedAt: now,
      };
      mockLabProducts = [copy, ...mockLabProducts];
      return mockDelay(copy);
    }
    const { data } = await apiClient.post<LabProduct>(ENDPOINTS.duplicate(id));
    return data;
  },

  async remove(id: string): Promise<void> {
    if (env.useMockApi) {
      mockLabProducts = mockLabProducts.filter((p) => p.id !== id);
      return mockDelay(undefined);
    }
    await apiClient.delete(ENDPOINTS.byId(id));
  },

  /** Returns a download URL for the requested export. Mock returns a stable placeholder link. */
  async requestExport(productId: string, format: LabExportFormat): Promise<{ url: string }> {
    if (env.useMockApi) {
      return mockDelay({ url: `/mock-exports/${productId}/${format}` });
    }
    const { data } = await apiClient.post<{ url: string }>(ENDPOINTS.export(productId), { format });
    return data;
  },
};
