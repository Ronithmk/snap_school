import type { ID, ISODateString } from "./common";
import type { CartLineItem, ShippingMethodId } from "./cart";

export type OrderStatus =
  | "pending_payment"
  | "cod"
  | "paid"
  | "processing"
  | "ready_for_download"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "razorpay";

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currencyCode: string;
}

export interface Order {
  id: ID;
  orderNumber: string;
  schoolId: ID;
  schoolName: string;
  albumId: ID;
  albumTitle: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: CartLineItem[];
  totals: OrderTotals;
  shippingMethodId: ShippingMethodId | null;
  shippingAddress: ShippingAddress | null;
  countryCode: string;
  placedAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateOrderInput {
  schoolId: ID;
  schoolName: string;
  albumId: ID;
  albumTitle: string;
  items: CartLineItem[];
  totals: OrderTotals;
  shippingMethodId: ShippingMethodId | null;
  shippingAddress: ShippingAddress | null;
  customerName: string;
  customerEmail: string;
  countryCode: string;
  paymentMethod: PaymentMethod;
}

export interface CreateRazorpayOrderResult {
  orderId: ID;
  orderNumber: string;
  razorpayOrderId: string | null;
  razorpayKeyId: string | null;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
}

export interface VerifyPaymentInput {
  orderId: ID;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderListFilters {
  status?: string;
  schoolId?: ID;
  search?: string;
}

export type DownloadAssetType = "jpg" | "pdf_contact_sheet" | "zip_package";

export interface DownloadAssetRequest {
  orderId: ID;
  assetType: DownloadAssetType;
}
