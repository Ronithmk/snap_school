import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlbumCart, AppliedCoupon, CartLineItem, ShippingMethodId } from "@/types";

function cartKey(schoolId: string, albumId: string) {
  return `${schoolId}:${albumId}`;
}

function emptyCart(schoolId: string, albumId: string, currencyCode: string): AlbumCart {
  return { schoolId, albumId, currencyCode, items: [], coupon: null, shippingMethodId: null };
}

interface CartState {
  carts: Record<string, AlbumCart>;
  getCart: (schoolId: string, albumId: string, currencyCode: string) => AlbumCart;
  addItem: (schoolId: string, albumId: string, currencyCode: string, item: Omit<CartLineItem, "id">) => void;
  removeItem: (schoolId: string, albumId: string, lineItemId: string) => void;
  updateQuantity: (schoolId: string, albumId: string, lineItemId: string, quantity: number) => void;
  applyCoupon: (schoolId: string, albumId: string, coupon: AppliedCoupon) => void;
  removeCoupon: (schoolId: string, albumId: string) => void;
  setShippingMethod: (schoolId: string, albumId: string, methodId: ShippingMethodId | null) => void;
  clearCart: (schoolId: string, albumId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},

      getCart: (schoolId, albumId, currencyCode) =>
        get().carts[cartKey(schoolId, albumId)] ?? emptyCart(schoolId, albumId, currencyCode),

      addItem: (schoolId, albumId, currencyCode, item) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const cart = state.carts[key] ?? emptyCart(schoolId, albumId, currencyCode);
          const existing = cart.items.find((i) => i.photoId === item.photoId && i.priceListItemId === item.priceListItemId);
          const items = existing
            ? cart.items.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i))
            : [...cart.items, { ...item, id: `cli_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }];
          return { carts: { ...state.carts, [key]: { ...cart, items } } };
        }),

      removeItem: (schoolId, albumId, lineItemId) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const cart = state.carts[key];
          if (!cart) return state;
          return { carts: { ...state.carts, [key]: { ...cart, items: cart.items.filter((i) => i.id !== lineItemId) } } };
        }),

      updateQuantity: (schoolId, albumId, lineItemId, quantity) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const cart = state.carts[key];
          if (!cart) return state;
          const items = cart.items
            .map((i) => (i.id === lineItemId ? { ...i, quantity: Math.max(1, quantity) } : i))
            .filter((i) => i.quantity > 0);
          return { carts: { ...state.carts, [key]: { ...cart, items } } };
        }),

      applyCoupon: (schoolId, albumId, coupon) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const cart = state.carts[key] ?? emptyCart(schoolId, albumId, "USD");
          return { carts: { ...state.carts, [key]: { ...cart, coupon } } };
        }),

      removeCoupon: (schoolId, albumId) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const cart = state.carts[key];
          if (!cart) return state;
          return { carts: { ...state.carts, [key]: { ...cart, coupon: null } } };
        }),

      setShippingMethod: (schoolId, albumId, methodId) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const cart = state.carts[key] ?? emptyCart(schoolId, albumId, "USD");
          return { carts: { ...state.carts, [key]: { ...cart, shippingMethodId: methodId } } };
        }),

      clearCart: (schoolId, albumId) =>
        set((state) => {
          const key = cartKey(schoolId, albumId);
          const { [key]: _removed, ...rest } = state.carts;
          return { carts: rest };
        }),
    }),
    { name: "snapschool.cart" },
  ),
);
