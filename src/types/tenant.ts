import type { ID, ISODateString } from "./common";

export interface CountryOption {
  code: string;
  name: string;
  currencyCode: string;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  /** Exchange rate relative to the platform base currency. Replace with live-rate lookups later. */
  rateToBase: number;
}

export interface TaxSettings {
  enabled: boolean;
  /** Percentage, e.g. 7.5 for 7.5% */
  rate: number;
  label: string;
  inclusive: boolean;
}

export interface WatermarkSettings {
  enabled: boolean;
  /** 1–3 lines of text rendered on preview images */
  lines: string[];
  /** Opacity of the watermark text — 0.05 to 0.40 */
  opacity: number;
  /** How the text is laid out over the image */
  pattern: "diagonal" | "tiled" | "center";
  /** Text colour — white works on dark photos, black on light */
  color: "white" | "black";
}

export interface SchoolSettings {
  countryCode: string;
  currencyCode: string;
  tax: TaxSettings;
  supportEmail?: string;
  // ── White-label branding ──────────────────────────────────────
  primaryColor?: string;
  /** Custom footer tagline shown on the storefront. */
  footerText?: string;
  /** Whether to show "Powered by SnapSchool" in the footer. */
  showPoweredBy?: boolean;
  /** Custom domain the school wants (display only — DNS must be configured externally). */
  customDomain?: string;
  // ── Social / contact ─────────────────────────────────────────
  whatsappNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  // ── Language ─────────────────────────────────────────────────
  /** Default storefront locale for parents visiting this school's portal. */
  defaultLocale?: string;
  // ── Watermark ─────────────────────────────────────────────────
  watermark?: WatermarkSettings;
}

export type SchoolStatus = "active" | "inactive" | "archived";

/** A tenant. Slug is the unique routing key: /[slug]. */
export interface School {
  id: ID;
  slug: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  status: SchoolStatus;
  settings: SchoolSettings;
  classCount: number;
  albumCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateSchoolInput {
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  settings: SchoolSettings;
}

export type UpdateSchoolInput = Partial<CreateSchoolInput> & { status?: SchoolStatus };
