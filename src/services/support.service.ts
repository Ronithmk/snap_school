import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import type { SupportTicket, SupportTicketInput, SupportTicketStatus } from "@/types";

const ENDPOINTS = {
  tickets: "/support",
  ticket: (id: string) => `/support/${id}`,
} as const;

export const supportService = {
  async submit(input: SupportTicketInput): Promise<void> {
    if (env.useMockApi) return mockDelay(undefined);
    await apiClient.post(ENDPOINTS.tickets, input);
  },

  async list(): Promise<SupportTicket[]> {
    if (env.useMockApi) return mockDelay([]);
    const { data } = await apiClient.get<SupportTicket[]>(ENDPOINTS.tickets);
    return data;
  },

  async updateStatus(ticketId: string, status: SupportTicketStatus): Promise<SupportTicket> {
    if (env.useMockApi) return mockDelay({ id: ticketId, status } as SupportTicket);
    const { data } = await apiClient.patch<SupportTicket>(ENDPOINTS.ticket(ticketId), { status });
    return data;
  },
};
