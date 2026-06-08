import type { ID } from "./common";

export interface CartLineItem {
  id: ID;
  photoId: ID;
  priceListItemId: ID;
  /** Snapshot of the item name/price at the time it was added, so totals stay stable. */
  name: string;
  unitPrice: number;
  quantity: number;
  thumbnailUrl: string;
}

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
}

export type ShippingMethodId = "digital_only" | "standard_print" | "express_print";

export interface ShippingOption {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
}

/** Carts are scoped per album: cart key = `${schoolSlug}:${albumId}`. */
export interface AlbumCart {
  schoolId: ID;
  albumId: ID;
  currencyCode: string;
  items: CartLineItem[];
  coupon: AppliedCoupon | null;
  shippingMethodId: ShippingMethodId | null;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}
