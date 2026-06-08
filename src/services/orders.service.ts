import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, paginate, searchFilter } from "@/services/mock/transport";
import { MOCK_ORDERS } from "@/services/mock/orders";
import type {
  CreateOrderInput,
  DownloadAssetRequest,
  Order,
  OrderListFilters,
  PaginatedResponse,
  QueryParams,
} from "@/types";

const ENDPOINTS = {
  list: "/orders",
  create: "/orders",
  byId: (id: string) => `/orders/${id}`,
  download: (id: string) => `/orders/${id}/download`,
  exportCsv: "/orders/export",
} as const;

export const ordersService = {
  /** Places an order from a checkout submission. Mock mode appends a fresh order to the in-memory list. */
  async create(input: CreateOrderInput): Promise<Order> {
    if (env.useMockApi) {
      const now = new Date().toISOString();
      const order: Order = {
        id: `ord_${Date.now()}`,
        orderNumber: `SS-${2026000 + MOCK_ORDERS.length}`,
        schoolId: input.schoolId,
        schoolName: input.schoolName,
        albumId: input.albumId,
        albumTitle: input.albumTitle,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        status: "pending_payment",
        items: input.items,
        totals: input.totals,
        shippingMethodId: input.shippingMethodId,
        shippingAddress: input.shippingAddress,
        countryCode: input.countryCode,
        placedAt: now,
        updatedAt: now,
      };
      MOCK_ORDERS.unshift(order);
      return mockDelay(order, 500);
    }
    const { data } = await apiClient.post<Order>(ENDPOINTS.create, input);
    return data;
  },

  async list(filters: OrderListFilters & QueryParams = {}): Promise<PaginatedResponse<Order>> {
    if (env.useMockApi) {
      let items = [...MOCK_ORDERS];
      if (filters.status) items = items.filter((o) => o.status === filters.status);
      if (filters.schoolId) items = items.filter((o) => o.schoolId === filters.schoolId);
      items = searchFilter(items, filters.search, ["orderNumber", "customerName", "customerEmail"]);
      items.sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
      return mockDelay(paginate(items, filters));
    }
    const { data } = await apiClient.get<PaginatedResponse<Order>>(ENDPOINTS.list, { params: filters });
    return data;
  },

  async getById(orderId: string): Promise<Order | null> {
    if (env.useMockApi) {
      return mockDelay(MOCK_ORDERS.find((o) => o.id === orderId) ?? null);
    }
    const { data } = await apiClient.get<Order>(ENDPOINTS.byId(orderId));
    return data;
  },

  /** Returns a download URL for the requested asset. Mock returns a stable placeholder link. */
  async requestDownload({ orderId, assetType }: DownloadAssetRequest): Promise<{ url: string }> {
    if (env.useMockApi) {
      return mockDelay({ url: `/mock-downloads/${orderId}/${assetType}` });
    }
    const { data } = await apiClient.post<{ url: string }>(ENDPOINTS.download(orderId), { assetType });
    return data;
  },

  async exportCsv(filters: OrderListFilters = {}): Promise<Blob> {
    if (env.useMockApi) {
      const { data } = await this.list({ ...filters, pageSize: 1000 });
      const header = "Order Number,School,Album,Customer,Status,Total,Currency,Placed At\n";
      const rows = data
        .map((o) =>
          [o.orderNumber, o.schoolName, o.albumTitle, o.customerName, o.status, o.totals.total, o.totals.currencyCode, o.placedAt].join(","),
        )
        .join("\n");
      return mockDelay(new Blob([header + rows], { type: "text/csv" }));
    }
    const { data } = await apiClient.get<Blob>(ENDPOINTS.exportCsv, { params: filters, responseType: "blob" });
    return data;
  },
};
