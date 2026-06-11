import type { Order, OrderTotals } from "@/types";
import type { CartLineItem } from "@/types/cart";

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return (value as T) ?? fallback;
}

interface AuthUser {
  id: string;
  role: string;
  schoolIds?: string[];
}

interface OrderListFilters {
  schoolId?: string | null;
  status?: string | null;
  search?: string | null;
}

/** Builds a Prisma `where` clause for `db.order.findMany`, scoping non-platform-admins to their schools. */
export function buildOrdersWhere(user: AuthUser, filters: OrderListFilters): Record<string, unknown> | { __unauthorized: true } {
  const { schoolId, status, search } = filters;
  const where: Record<string, unknown> = {};

  if (user.role !== "platform_admin") {
    const allowedSchoolIds = user.schoolIds ?? [];
    if (schoolId) {
      if (!allowedSchoolIds.includes(schoolId)) return { __unauthorized: true };
      where.schoolId = schoolId;
    } else {
      where.schoolId = { in: allowedSchoolIds };
    }
  } else if (schoolId) {
    where.schoolId = schoolId;
  }

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { orderNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

/** Shapes a Prisma `Order` (optionally with its `school` relation included) into the API/`Order` type. */
export function fmtOrder(o: any): Order { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    schoolId: o.schoolId,
    schoolName: o.school?.name ?? "",
    albumId: o.albumId ?? null,
    albumTitle: o.albumTitle ?? "",
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status,
    items: parseJsonField<CartLineItem[]>(o.items, []),
    totals: parseJsonField<OrderTotals>(o.totals, { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, currencyCode: "INR" }),
    shippingMethodId: o.shippingMethodId ?? null,
    shippingAddress: parseJsonField(o.shippingAddress, null),
    countryCode: o.countryCode ?? null,
    placedAt: o.placedAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
