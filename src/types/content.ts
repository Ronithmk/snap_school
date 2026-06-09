import type { ID, ISODateString } from "./common";

// ── Content block (CMS) ────────────────────────────────────────────

export type ContentBlockType = "banner" | "announcement" | "promotion" | "sponsor";

export type AnnouncementStyle = "info" | "success" | "warning" | "promo";

/**
 * A school-editable content block rendered on their storefront.
 * Supports hero banners, announcement bars, promotional cards, and sponsor logos.
 */
export interface ContentBlock {
  id: ID;
  schoolId: ID;
  type: ContentBlockType;
  title?: string;
  subtitle?: string;
  /** Text body — used by announcement and promotion types. */
  body?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Color scheme for announcement bars. */
  announcementStyle?: AnnouncementStyle;
  /** 0 = shown first. Lower = higher priority. */
  priority: number;
  enabled: boolean;
  /** ISO date — block hidden before this date. */
  startsAt?: ISODateString;
  /** ISO date — block hidden after this date. */
  endsAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateContentBlockInput {
  type: ContentBlockType;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  announcementStyle?: AnnouncementStyle;
  priority?: number;
  enabled?: boolean;
  startsAt?: ISODateString;
  endsAt?: ISODateString;
}

export type UpdateContentBlockInput = Partial<CreateContentBlockInput>;

// ── Pricing rules ──────────────────────────────────────────────────

export type PricingRuleType = "percent_off" | "flat_off" | "free_shipping";
export type PricingRuleScope = "all" | "album" | "class";

/**
 * Dynamic pricing rule scoped to a school (and optionally an album or class).
 * Rules are evaluated at cart time; the highest discount wins.
 */
export interface PricingRule {
  id: ID;
  schoolId: ID;
  label: string;
  type: PricingRuleType;
  /** Percent (0-100) for percent_off; currency amount for flat_off; ignored for free_shipping. */
  value: number;
  scope: PricingRuleScope;
  /** albumId or classId when scope is not "all". */
  scopeId?: ID;
  scopeName?: string;
  minOrderAmount?: number;
  startsAt?: ISODateString;
  endsAt?: ISODateString;
  enabled: boolean;
  createdAt: ISODateString;
}

export interface CreatePricingRuleInput {
  label: string;
  type: PricingRuleType;
  value: number;
  scope: PricingRuleScope;
  scopeId?: ID;
  scopeName?: string;
  minOrderAmount?: number;
  startsAt?: ISODateString;
  endsAt?: ISODateString;
  enabled?: boolean;
}

export type UpdatePricingRuleInput = Partial<CreatePricingRuleInput>;
