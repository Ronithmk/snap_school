import type { ID, ISODateString, PaginatedResponse } from "./common";

export interface MarketingEmailEntry {
  id: ID;
  name: string;
  email: string;
  schoolNames: string[];
  marketingOptOut: boolean;
  createdAt: ISODateString;
}

export interface MarketingStats {
  total: number;
  optedOut: number;
  last30Days: number;
}

export interface MarketingEmailsResponse extends PaginatedResponse<MarketingEmailEntry> {
  stats: MarketingStats;
}

export interface MarketingEmailListFilters {
  search?: string;
  schoolId?: string;
  page?: number;
  pageSize?: number;
}

export interface MarketingCampaignInput {
  subject: string;
  body: string;
}

export interface MarketingCampaign {
  id: ID;
  subject: string;
  body: string;
  recipientCount: number;
  createdAt: ISODateString;
}

export interface SendMarketingCampaignResult extends MarketingCampaign {
  emailsSent: boolean;
}
