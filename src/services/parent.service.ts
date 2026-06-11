import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, paginate } from "@/services/mock/transport";
import type { LinkChildInput, Order, OrderListFilters, PaginatedResponse, ParentChild, ParentRegisterInput, LoginResult, QueryParams } from "@/types";

const ENDPOINTS = {
  register: "/auth/parent-register",
  children: "/parent/children",
  orders: "/parent/orders",
} as const;

export const parentService = {
  async register(input: ParentRegisterInput): Promise<LoginResult> {
    if (env.useMockApi) return mockDelay({} as LoginResult);
    const { data } = await apiClient.post<LoginResult>(ENDPOINTS.register, input);
    return data;
  },

  async getChildren(): Promise<ParentChild[]> {
    if (env.useMockApi) return mockDelay([]);
    const { data } = await apiClient.get<ParentChild[]>(ENDPOINTS.children);
    return data;
  },

  async linkChild(input: LinkChildInput): Promise<void> {
    if (env.useMockApi) return mockDelay(undefined);
    await apiClient.post(ENDPOINTS.children, input);
  },

  async getOrders(filters: OrderListFilters & QueryParams = {}): Promise<PaginatedResponse<Order>> {
    if (env.useMockApi) return mockDelay(paginate([], filters));
    const { data } = await apiClient.get<PaginatedResponse<Order>>(ENDPOINTS.orders, { params: filters });
    return data;
  },
};
