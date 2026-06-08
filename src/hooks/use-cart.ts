"use client";

import { useMemo } from "react";
import { useCartStore } from "@/stores/cart.store";
import { computeCartTotals } from "@/lib/cart-totals";
import type { AppliedCoupon, CartLineItem, School, ShippingMethodId } from "@/types";

/**
 * Scopes the shared cart store to a single album, matching the "separate cart per album"
 * requirement. Returns the cart, derived totals, and bound mutation actions.
 */
export function useAlbumCart(school: School | null | undefined, albumId: string) {
  const schoolId = school?.id ?? "";
  const currencyCode = school?.settings.currencyCode ?? "USD";

  const cart = useCartStore((s) => (schoolId ? s.getCart(schoolId, albumId, currencyCode) : null));
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const setShippingMethod = useCartStore((s) => s.setShippingMethod);
  const clearCart = useCartStore((s) => s.clearCart);

  const totals = useMemo(
    () => (cart && school ? computeCartTotals(cart, school.settings.tax) : null),
    [cart, school],
  );

  return {
    cart,
    totals,
    currencyCode,
    addItem: (item: Omit<CartLineItem, "id">) => schoolId && addItem(schoolId, albumId, currencyCode, item),
    removeItem: (lineItemId: string) => schoolId && removeItem(schoolId, albumId, lineItemId),
    updateQuantity: (lineItemId: string, quantity: number) => schoolId && updateQuantity(schoolId, albumId, lineItemId, quantity),
    applyCoupon: (coupon: AppliedCoupon) => schoolId && applyCoupon(schoolId, albumId, coupon),
    removeCoupon: () => schoolId && removeCoupon(schoolId, albumId),
    setShippingMethod: (methodId: ShippingMethodId | null) => schoolId && setShippingMethod(schoolId, albumId, methodId),
    clearCart: () => schoolId && clearCart(schoolId, albumId),
  };
}
