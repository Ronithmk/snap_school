import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import type {
  MarketingCampaign,
  MarketingCampaignInput,
  MarketingEmailListFilters,
  MarketingEmailsResponse,
  SendMarketingCampaignResult,
} from "@/types";

const ENDPOINTS = {
  emails: "/marketing/emails",
  emailsExport: "/marketing/emails/export",
  email: (userId: string) => `/marketing/emails/${userId}`,
  campaigns: "/marketing/campaigns",
} as const;

const EMPTY_RESPONSE: MarketingEmailsResponse = {
  data: [],
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  stats: { total: 0, optedOut: 0, last30Days: 0 },
};

export const marketingService = {
  async listEmails(filters: MarketingEmailListFilters = {}): Promise<MarketingEmailsResponse> {
    if (env.useMockApi) return mockDelay(EMPTY_RESPONSE);
    const { data } = await apiClient.get<MarketingEmailsResponse>(ENDPOINTS.emails, { params: filters });
    return data;
  },

  async exportEmailsCsv(): Promise<Blob> {
    if (env.useMockApi) return mockDelay(new Blob([""], { type: "text/csv" }));
    const { data } = await apiClient.get<Blob>(ENDPOINTS.emailsExport, { responseType: "blob" });
    return data;
  },

  async setOptOut(userId: string, marketingOptOut: boolean): Promise<{ id: string; marketingOptOut: boolean }> {
    if (env.useMockApi) return mockDelay({ id: userId, marketingOptOut });
    const { data } = await apiClient.patch<{ id: string; marketingOptOut: boolean }>(ENDPOINTS.email(userId), {
      marketingOptOut,
    });
    return data;
  },

  async listCampaigns(): Promise<MarketingCampaign[]> {
    if (env.useMockApi) return mockDelay([]);
    const { data } = await apiClient.get<MarketingCampaign[]>(ENDPOINTS.campaigns);
    return data;
  },

  async sendCampaign(input: MarketingCampaignInput): Promise<SendMarketingCampaignResult> {
    if (env.useMockApi) {
      return mockDelay({ id: "mock", ...input, recipientCount: 0, createdAt: new Date().toISOString(), emailsSent: false });
    }
    const { data } = await apiClient.post<SendMarketingCampaignResult>(ENDPOINTS.campaigns, input);
    return data;
  },
};
