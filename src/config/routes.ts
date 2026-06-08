/**
 * Centralized route builders. Keep all path strings here so renames/refactors stay one-line edits.
 */
export const routes = {
  home: () => "/",
  login: () => "/auth/login",

  dashboard: {
    root: () => "/dashboard",
    analytics: () => "/dashboard/analytics",
    orders: () => "/dashboard/orders",
    order: (orderId: string) => `/dashboard/orders/${orderId}`,
    schools: () => "/dashboard/schools",
    school: (schoolId: string) => `/dashboard/schools/${schoolId}`,
    class: (schoolId: string, classId: string) => `/dashboard/schools/${schoolId}/classes/${classId}`,
    album: (schoolId: string, albumId: string) => `/dashboard/schools/${schoolId}/albums/${albumId}`,
    priceLists: () => "/dashboard/price-lists",
    lab: () => "/dashboard/lab",
    labProducts: () => "/dashboard/lab/products",
    labEditor: (productId: string) => `/dashboard/lab/editor/${productId}`,
    settings: () => "/dashboard/settings",
  },

  storefront: {
    school: (schoolSlug: string) => `/${schoolSlug}`,
    class: (schoolSlug: string, classSlug: string) => `/${schoolSlug}/${classSlug}`,
    album: (schoolSlug: string, albumId: string) => `/${schoolSlug}/album/${albumId}`,
    albumAccess: (schoolSlug: string, albumId: string) =>
      `/${schoolSlug}/album/${albumId}/access`,
    cart: (schoolSlug: string, albumId: string) => `/${schoolSlug}/album/${albumId}/cart`,
    checkout: (schoolSlug: string, albumId: string) =>
      `/${schoolSlug}/album/${albumId}/checkout`,
  },
} as const;
