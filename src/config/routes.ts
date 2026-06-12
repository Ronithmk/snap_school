/**
 * Centralized route builders. Keep all path strings here so renames/refactors stay one-line edits.
 */
export const routes = {
  home: () => "/",
  login: () => "/auth/login",
  adminLogin: () => "/auth/admin-login",
  register: () => "/auth/register",
  parentLogin: () => "/auth/parent-login",
  parentRegister: () => "/auth/parent-register",
  support: () => "/support",
  forgotPassword: () => "/auth/forgot-password",
  resetPassword: (token?: string) => token ? `/auth/reset-password?token=${token}` : "/auth/reset-password",

  parent: {
    root: () => "/parent",
    addChild: () => "/parent/add-child",
    orders: () => "/parent/orders",
  },

  dashboard: {
    root: () => "/dashboard",
    analytics: () => "/dashboard/analytics",
    orders: () => "/dashboard/orders",
    order: (orderId: string) => `/dashboard/orders/${orderId}`,
    schools: () => "/dashboard/schools",
    school: (schoolId: string) => `/dashboard/schools/${schoolId}`,
    class: (schoolId: string, classId: string) => `/dashboard/schools/${schoolId}/classes/${classId}`,
    classSort: (schoolId: string, classId: string) => `/dashboard/schools/${schoolId}/classes/${classId}/sort`,
    album: (schoolId: string, albumId: string) => `/dashboard/schools/${schoolId}/albums/${albumId}`,
    priceLists: () => "/dashboard/price-lists",
    // ── School-level routes ────────────────────────────────────────
    schoolClasses: (id: string) => `/dashboard/schools/${id}/classes`,
    schoolAlbums: (id: string) => `/dashboard/schools/${id}/albums`,
    schoolTags: (id: string) => `/dashboard/schools/${id}/tags`,
    schoolPriceLists: (id: string) => `/dashboard/schools/${id}/price-lists`,
    schoolProductLibrary: (id: string) => `/dashboard/schools/${id}/product-library`,
    schoolCatalogue: (id: string) => `/dashboard/schools/${id}/catalogue`,
    accessCards: (schoolId: string) => `/dashboard/schools/${schoolId}/access-cards`,
    schoolGroupOrders: (id: string) => `/dashboard/schools/${id}/group-orders`,
    schoolParentalConnections: (id: string) => `/dashboard/schools/${id}/parental-connections`,
    schoolReportOrders: (id: string) => `/dashboard/schools/${id}/reports/orders`,
    schoolReportSales: (id: string) => `/dashboard/schools/${id}/reports/sales`,
    schoolReportSalesReport: (id: string) => `/dashboard/schools/${id}/reports/sales-report`,
    schoolReportSalesOverview: (id: string) => `/dashboard/schools/${id}/reports/sales-overview`,
    schoolReportSalesOverviewByClass: (id: string) => `/dashboard/schools/${id}/reports/sales-overview/by-class`,
    schoolReportSalesOverviewStudents: (id: string) => `/dashboard/schools/${id}/reports/sales-overview/students`,
    schoolReportOrdersAwaiting: (id: string) => `/dashboard/schools/${id}/reports/orders-awaiting`,
    schoolReportCashSummary: (id: string) => `/dashboard/schools/${id}/reports/cash-summary`,
    schoolInvoices: (id: string) => `/dashboard/schools/${id}/invoices`,
    schoolApprovals: (id: string) => `/dashboard/schools/${id}/approvals`,
    schoolPrintQueue: (id: string) => `/dashboard/schools/${id}/print-queue`,
    // ── School settings ────────────────────────────────────────────
    schoolBranding: (id: string) => `/dashboard/schools/${id}/branding`,
    schoolContent: (id: string) => `/dashboard/schools/${id}/content`,
    schoolPricingRules: (id: string) => `/dashboard/schools/${id}/pricing-rules`,
    schoolIntegrations: (id: string) => `/dashboard/schools/${id}/integrations`,
    schoolAiTools: (id: string) => `/dashboard/schools/${id}/ai-tools`,
    // ───────────────────────────────────────────────────────────────
    lab: () => "/dashboard/lab",
    labProducts: () => "/dashboard/lab/products",
    labEditor: (productId: string) => `/dashboard/lab/editor/${productId}`,
    settings: () => "/dashboard/settings",
    support: () => "/dashboard/support",
    marketingEmails: () => "/dashboard/marketing/emails",
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
    parent: (schoolSlug: string, studentId: string) => `/${schoolSlug}/parents/${studentId}`,
    albumPhoto: (schoolSlug: string, albumId: string, photoId: string) =>
      `/${schoolSlug}/album/${albumId}/photo/${photoId}`,
  },
} as const;
