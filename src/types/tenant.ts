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

export interface SchoolSettings {
  countryCode: string;
  currencyCode: string;
  tax: TaxSettings;
  supportEmail?: string;
  primaryColor?: string;
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
  description?: string;
  settings: SchoolSettings;
}

export type UpdateSchoolInput = Partial<CreateSchoolInput> & { status?: SchoolStatus };
