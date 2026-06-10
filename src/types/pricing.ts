import type { ID, ISODateString } from "./common";

export type PriceItemType = "single_print" | "digital_download" | "package" | "addon";

export interface PriceListItem {
  id: ID;
  type: PriceItemType;
  name: string;
  description?: string;
  /** Amount in the price list's currency, in major units (e.g. 12.50). */
  amount: number;
  /** For "package" items: how many photos/prints it includes. */
  unitsIncluded?: number;
  /** Set when this item was added from the Product Lab — links back to its designed layout. */
  labProductId?: ID | null;
  /** Mockup/preview image shown in the storefront product picker and cart. */
  previewImageUrl?: string;
  /** Restricts this item to photos tagged with the same category. Null/empty = available for all photos. */
  category?: string | null;
}

export interface BulkDiscountTier {
  id: ID;
  /** Minimum quantity to qualify, e.g. 5 */
  minQuantity: number;
  /** Percentage off, e.g. 10 for 10% */
  discountPercent: number;
}

export interface PriceList {
  id: ID;
  schoolId: ID;
  name: string;
  countryCode: string;
  currencyCode: string;
  items: PriceListItem[];
  bulkDiscounts: BulkDiscountTier[];
  isDefault: boolean;
  updatedAt: ISODateString;
}

export interface CreatePriceListInput {
  schoolId: ID;
  name: string;
  countryCode: string;
  currencyCode: string;
  items: Omit<PriceListItem, "id">[];
  bulkDiscounts: Omit<BulkDiscountTier, "id">[];
}

export type UpdatePriceListInput = Partial<CreatePriceListInput> & { isDefault?: boolean };
