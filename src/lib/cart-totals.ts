import { SHIPPING_OPTIONS } from "@/config/constants";
import type { AlbumCart, CartTotals, TaxSettings } from "@/types";

/**
 * Pure pricing calculation shared by the cart drawer, cart page, and checkout summary —
 * keeps the three views from drifting out of sync.
 */
export function computeCartTotals(cart: AlbumCart, tax: TaxSettings): CartTotals {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = cart.coupon ? round(subtotal * (cart.coupon.discountPercent / 100)) : 0;
  const shipping = SHIPPING_OPTIONS.find((o) => o.id === cart.shippingMethodId)?.price ?? 0;

  const taxableBase = subtotal - discount + shipping;
  let tax_ = 0;
  let total: number;
  if (tax.enabled && tax.inclusive) {
    // Inclusive tax: the displayed prices already contain tax — surface it without adding to the total.
    tax_ = round(taxableBase - taxableBase / (1 + tax.rate / 100));
    total = round(taxableBase);
  } else if (tax.enabled) {
    tax_ = round(taxableBase * (tax.rate / 100));
    total = round(taxableBase + tax_);
  } else {
    total = round(taxableBase);
  }

  return { subtotal: round(subtotal), discount, shipping, tax: tax_, total, itemCount };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
