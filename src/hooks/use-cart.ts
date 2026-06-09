"use client";

import { useMemo } from "react";
import { useCartStore } from "@/stores/cart.store";
import { computeCartTotals } from "@/lib/cart-totals";
import type { AlbumCart, AppliedCoupon, CartLineItem, School, ShippingMethodId } from "@/types";

/**
 * Scopes the shared cart store to a single album, matching the "separate cart per album"
 * requirement. Returns the cart, derived totals, and bound mutation actions.
 */
export function useAlbumCart(school: School | null | undefined, albumId: string) {
  const schoolId = school?.id ?? "";
  const currencyCode = school?.settings.currencyCode ?? "USD";

  // Select the stored cart by key — returns a stable reference or undefined (never a new object).
  // Calling getCart() inside the selector would call emptyCart() on every render, creating a new
  // object reference each time; Zustand's getSnapshot equality check then detects a false change → infinite loop.
  const storedCart = useCartStore((s) => s.carts[`${schoolId}:${albumId}`] ?? null);

  // Memoize the empty-cart fallback so it doesn't produce a new reference on every render.
  const emptyCart = useMemo<AlbumCart | null>(
    () => (schoolId ? { schoolId, albumId, currencyCode, items: [], coupon: null, shippingMethodId: null } : null),
    [schoolId, albumId, currencyCode],
  );

  const cart = storedCart ?? emptyCart;
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
