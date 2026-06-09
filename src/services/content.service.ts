import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import type {
  ContentBlock,
  CreateContentBlockInput,
  PricingRule,
  CreatePricingRuleInput,
  UpdateContentBlockInput,
  UpdatePricingRuleInput,
} from "@/types";

// ── In-memory mock stores ─────────────────────────────────────────

const now = new Date().toISOString();

let mockBlocks: ContentBlock[] = [
  {
    id: "blk_riv_1",
    schoolId: "sch_riverside",
    type: "banner",
    title: "📸 School Photos Are Ready!",
    subtitle: "View and order your child's photos from our latest sessions.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=70",
    ctaLabel: "Browse Albums",
    ctaUrl: "#albums",
    priority: 0,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "blk_riv_2",
    schoolId: "sch_riverside",
    type: "announcement",
    title: "Order deadline: June 30th",
    body: "All print orders must be placed by June 30th to guarantee delivery before summer break.",
    announcementStyle: "warning",
    priority: 1,
    enabled: true,
    endsAt: "2026-06-30T23:59:59.000Z",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "blk_riv_3",
    schoolId: "sch_riverside",
    type: "promotion",
    title: "10% off this week",
    body: "Use code SPRING10 at checkout for 10% off all print orders.",
    ctaLabel: "Shop Now",
    ctaUrl: "#albums",
    announcementStyle: "promo",
    priority: 2,
    enabled: false,
    endsAt: "2026-06-15T23:59:59.000Z",
    createdAt: now,
    updatedAt: now,
  },
];

let mockRules: PricingRule[] = [
  {
    id: "rule_riv_1",
    schoolId: "sch_riverside",
    label: "Annual Day Discount",
    type: "percent_off",
    value: 15,
    scope: "all",
    enabled: true,
    startsAt: "2026-06-01T00:00:00.000Z",
    endsAt: "2026-06-30T23:59:59.000Z",
    createdAt: now,
  },
  {
    id: "rule_riv_2",
    schoolId: "sch_riverside",
    label: "Free Shipping on orders over ₹500",
    type: "free_shipping",
    value: 0,
    scope: "all",
    minOrderAmount: 500,
    enabled: true,
    createdAt: now,
  },
];

// ── Content Blocks Service ────────────────────────────────────────

export const contentService = {
  // Content blocks
  async listBlocks(schoolId: string): Promise<ContentBlock[]> {
    if (env.useMockApi) {
      return mockDelay(
        mockBlocks.filter((b) => b.schoolId === schoolId).sort((a, b) => a.priority - b.priority)
      );
    }
    const { data } = await apiClient.get<ContentBlock[]>(`/schools/${schoolId}/content`);
    return data;
  },

  async createBlock(schoolId: string, input: CreateContentBlockInput): Promise<ContentBlock> {
    if (env.useMockApi) {
      const block: ContentBlock = {
        id: `blk_${Date.now()}`,
        schoolId,
        priority: input.priority ?? mockBlocks.filter((b) => b.schoolId === schoolId).length,
        enabled: input.enabled ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...input,
      };
      mockBlocks = [...mockBlocks, block];
      return mockDelay(block);
    }
    const { data } = await apiClient.post<ContentBlock>(`/schools/${schoolId}/content`, input);
    return data;
  },

  async updateBlock(id: string, input: UpdateContentBlockInput): Promise<ContentBlock> {
    if (env.useMockApi) {
      const existing = mockBlocks.find((b) => b.id === id);
      if (!existing) throw new Error("Block not found");
      const updated: ContentBlock = { ...existing, ...input, updatedAt: new Date().toISOString() };
      mockBlocks = mockBlocks.map((b) => (b.id === id ? updated : b));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<ContentBlock>(`/content/${id}`, input);
    return data;
  },

  async deleteBlock(id: string): Promise<void> {
    if (env.useMockApi) {
      mockBlocks = mockBlocks.filter((b) => b.id !== id);
      return mockDelay(undefined);
    }
    await apiClient.delete(`/content/${id}`);
  },

  async reorderBlocks(schoolId: string, orderedIds: string[]): Promise<void> {
    if (env.useMockApi) {
      orderedIds.forEach((id, idx) => {
        const block = mockBlocks.find((b) => b.id === id && b.schoolId === schoolId);
        if (block) block.priority = idx;
      });
      return mockDelay(undefined);
    }
    await apiClient.post(`/schools/${schoolId}/content/reorder`, { orderedIds });
  },

  // Pricing rules
  async listRules(schoolId: string): Promise<PricingRule[]> {
    if (env.useMockApi) {
      return mockDelay(mockRules.filter((r) => r.schoolId === schoolId));
    }
    const { data } = await apiClient.get<PricingRule[]>(`/schools/${schoolId}/pricing-rules`);
    return data;
  },

  async createRule(schoolId: string, input: CreatePricingRuleInput): Promise<PricingRule> {
    if (env.useMockApi) {
      const rule: PricingRule = {
        id: `rule_${Date.now()}`,
        schoolId,
        enabled: input.enabled ?? true,
        createdAt: new Date().toISOString(),
        ...input,
      };
      mockRules = [...mockRules, rule];
      return mockDelay(rule);
    }
    const { data } = await apiClient.post<PricingRule>(`/schools/${schoolId}/pricing-rules`, input);
    return data;
  },

  async updateRule(id: string, input: UpdatePricingRuleInput): Promise<PricingRule> {
    if (env.useMockApi) {
      const existing = mockRules.find((r) => r.id === id);
      if (!existing) throw new Error("Rule not found");
      const updated: PricingRule = { ...existing, ...input };
      mockRules = mockRules.map((r) => (r.id === id ? updated : r));
      return mockDelay(updated);
    }
    const { data } = await apiClient.patch<PricingRule>(`/pricing-rules/${id}`, input);
    return data;
  },

  async deleteRule(id: string): Promise<void> {
    if (env.useMockApi) {
      mockRules = mockRules.filter((r) => r.id !== id);
      return mockDelay(undefined);
    }
    await apiClient.delete(`/pricing-rules/${id}`);
  },
};
