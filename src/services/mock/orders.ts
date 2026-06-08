import type { Order, OrderStatus } from "@/types";
import { MOCK_ALBUMS } from "./albums";
import { MOCK_SCHOOLS } from "./seed-data";

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "ready_for_download",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

const CUSTOMERS = [
  { name: "Maria Gonzalez", email: "maria.g@example.com", countryCode: "US" },
  { name: "Liam O'Connor", email: "liam.oconnor@example.com", countryCode: "GB" },
  { name: "Priya Sharma", email: "priya.sharma@example.com", countryCode: "IN" },
  { name: "Noah Bennett", email: "noah.bennett@example.com", countryCode: "US" },
  { name: "Aiko Tanaka", email: "aiko.tanaka@example.com", countryCode: "AU" },
  { name: "Lucas Mendes", email: "lucas.mendes@example.com", countryCode: "CA" },
];

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  IN: "INR",
  AU: "AUD",
  CA: "CAD",
};

function buildOrder(index: number): Order {
  const album = MOCK_ALBUMS[index % MOCK_ALBUMS.length];
  const school = MOCK_SCHOOLS.find((s) => s.id === album.schoolId)!;
  const customer = CUSTOMERS[index % CUSTOMERS.length];
  const status = STATUSES[index % STATUSES.length];
  const currencyCode = CURRENCY_BY_COUNTRY[customer.countryCode] ?? "USD";
  const subtotal = 25 + ((index * 17) % 120);
  const discount = index % 3 === 0 ? Math.round(subtotal * 0.1) : 0;
  const shipping = index % 4 === 0 ? 4.99 : 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;
  const day = 1 + (index % 27);

  return {
    id: `ord_${1000 + index}`,
    orderNumber: `SS-${2026000 + index}`,
    schoolId: school.id,
    schoolName: school.name,
    albumId: album.id,
    albumTitle: album.title,
    customerName: customer.name,
    customerEmail: customer.email,
    status,
    items: [],
    totals: { subtotal, discount, shipping, tax, total, currencyCode },
    shippingMethodId: shipping > 0 ? "standard_print" : "digital_only",
    shippingAddress: null,
    countryCode: customer.countryCode,
    placedAt: `2026-0${1 + (index % 5)}-${String(day).padStart(2, "0")}T10:30:00.000Z`,
    updatedAt: `2026-0${1 + (index % 5)}-${String(day).padStart(2, "0")}T10:30:00.000Z`,
  };
}

export const MOCK_ORDERS: Order[] = Array.from({ length: 36 }, (_, i) => buildOrder(i));
