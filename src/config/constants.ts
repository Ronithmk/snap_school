import type {
  AlbumVisibility,
  LabElementType,
  LabProductStatus,
  LabProductType,
  OrderStatus,
  SchoolStatus,
  ShippingOption,
  UserRole,
} from "@/types";

export const QUERY_STALE_TIME_MS = 60_000;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  ready_for_download: "Ready for Download",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "neutral" | "positive" | "warning" | "negative"> = {
  pending_payment: "warning",
  paid: "positive",
  processing: "neutral",
  ready_for_download: "positive",
  shipped: "positive",
  completed: "positive",
  cancelled: "negative",
  refunded: "negative",
};

export const SCHOOL_STATUS_LABELS: Record<SchoolStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const SCHOOL_STATUS_TONE: Record<SchoolStatus, "neutral" | "positive" | "warning" | "negative"> = {
  active: "positive",
  inactive: "warning",
  archived: "neutral",
};

export const ALBUM_VISIBILITY_LABELS: Record<AlbumVisibility, string> = {
  public: "Public",
  unlisted: "Unlisted",
  private: "Private",
};

export const ALBUM_VISIBILITY_TONE: Record<AlbumVisibility, "neutral" | "positive" | "warning" | "negative"> = {
  public: "positive",
  unlisted: "warning",
  private: "neutral",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: "Platform Admin",
  school_admin: "School Admin",
};

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "digital_only",
    label: "Digital download only",
    description: "Receive a download link by email — no physical shipping.",
    price: 0,
  },
  {
    id: "standard_print",
    label: "Standard print shipping",
    description: "Printed photos delivered in 5-7 business days.",
    price: 4.99,
  },
  {
    id: "express_print",
    label: "Express print shipping",
    description: "Printed photos delivered in 1-2 business days.",
    price: 12.99,
  },
];

export const PHOTO_GRID_PAGE_SIZE = 24;
export const ALBUM_PAGE_SIZE = 12;
export const ORDERS_PAGE_SIZE = 10;
export const LAB_PRODUCTS_PAGE_SIZE = 12;

export const LAB_PRODUCT_STATUS_LABELS: Record<LabProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const LAB_PRODUCT_STATUS_TONES: Record<LabProductStatus, "neutral" | "positive" | "warning" | "negative"> = {
  draft: "neutral",
  published: "positive",
  archived: "warning",
};

export const LAB_PRODUCT_TYPE_LABELS: Record<LabProductType, string> = {
  single_print: "Single photo print",
  collage: "Multi-photo collage",
  planche_1: "Planche — 1 photo",
  planche_2: "Planche — 2 photos",
  team_sheet: "Team sheet",
  magazine: "Magazine layout",
  certificate: "Certificate",
  id_card: "ID card",
  custom: "Custom layout",
};

export const LAB_ELEMENT_TYPE_LABELS: Record<LabElementType, string> = {
  photo: "Photo",
  text: "Text",
  shape: "Shape",
};
