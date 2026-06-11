import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { COUNTRIES } from "@/config/currency";

const ACTIVE_STATUSES = ["pending_payment", "cancelled", "refunded"];

function parseTotals(totals: unknown): { total: number; currencyCode: string } {
  try {
    const parsed = typeof totals === "string" ? JSON.parse(totals) : totals;
    return {
      total: typeof parsed?.total === "number" ? parsed.total : 0,
      currencyCode: typeof parsed?.currencyCode === "string" ? parsed.currencyCode : "USD",
    };
  } catch {
    return { total: 0, currencyCode: "USD" };
  }
}

function parseItems(items: unknown): unknown[] {
  try {
    const parsed = typeof items === "string" ? JSON.parse(items) : items;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseAddress(address: unknown) {
  try {
    return typeof address === "string" ? JSON.parse(address) : address ?? null;
  } catch {
    return null;
  }
}

function fmtOrder(o: any) {
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
    items: parseItems(o.items),
    totals: (() => {
      try {
        return typeof o.totals === "string" ? JSON.parse(o.totals) : o.totals ?? {};
      } catch {
        return {};
      }
    })(),
    shippingMethodId: o.shippingMethodId ?? null,
    shippingAddress: parseAddress(o.shippingAddress),
    countryCode: o.countryCode ?? null,
    placedAt: o.placedAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const isPlatformAdmin = user.role === "platform_admin";
  const schoolIds = user.schoolIds ?? [];

  if (!isPlatformAdmin && schoolIds.length === 0) {
    return ok(emptyOverview());
  }

  const schoolWhere = isPlatformAdmin ? {} : { schoolId: { in: schoolIds } };

  const orders = await db.order.findMany({
    where: schoolWhere,
    include: { school: true },
    orderBy: { placedAt: "desc" },
  });

  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseTotals(o.totals).total, 0);
  const totalOrders = orders.length;
  const currencyCode = completedOrders.length ? parseTotals(completedOrders[0].totals).currencyCode : "USD";

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const revenueSeries = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startOfDay(now).getTime() - (13 - i) * dayMs);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOrders = completedOrders.filter((o) => o.placedAt.toISOString().slice(0, 10) === dateStr);
    return {
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + parseTotals(o.totals).total, 0),
      orders: dayOrders.length,
    };
  });

  const cutoff14 = new Date(now.getTime() - 14 * dayMs);
  const cutoff28 = new Date(now.getTime() - 28 * dayMs);
  const last14 = completedOrders.filter((o) => o.placedAt >= cutoff14);
  const prev14 = completedOrders.filter((o) => o.placedAt >= cutoff28 && o.placedAt < cutoff14);
  const last14Revenue = last14.reduce((sum, o) => sum + parseTotals(o.totals).total, 0);
  const prev14Revenue = prev14.reduce((sum, o) => sum + parseTotals(o.totals).total, 0);
  const revenueChangePercent = prev14Revenue > 0 ? ((last14Revenue - prev14Revenue) / prev14Revenue) * 100 : 0;
  const ordersChangePercent = prev14.length > 0 ? ((last14.length - prev14.length) / prev14.length) * 100 : 0;

  const countrySales = COUNTRIES.map((country) => {
    const countryOrders = orders.filter((o) => o.countryCode === country.code);
    return {
      countryCode: country.code,
      countryName: country.name,
      revenue: countryOrders.reduce((sum, o) => sum + parseTotals(o.totals).total, 0),
      orders: countryOrders.length,
    };
  })
    .filter((c) => c.orders > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const albums = await db.album.findMany({
    where: schoolWhere,
    include: { school: true },
  });

  const popularAlbums = albums
    .map((album) => {
      const albumOrders = orders.filter((o) => o.albumId === album.id);
      return {
        albumId: album.id,
        albumTitle: album.title,
        schoolName: album.school?.name ?? "",
        views: 0,
        orders: albumOrders.length,
        revenue: albumOrders.reduce((sum, o) => sum + parseTotals(o.totals).total, 0),
      };
    })
    .filter((a) => a.orders > 0)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 6).map(fmtOrder);

  return ok({
    summary: {
      totalRevenue,
      totalOrders,
      conversionRate: 0,
      averageOrderValue: completedOrders.length ? totalRevenue / completedOrders.length : 0,
      currencyCode,
      revenueChangePercent,
      ordersChangePercent,
    },
    revenueSeries,
    countrySales,
    popularAlbums,
    recentOrders,
  });
}

function emptyOverview() {
  return {
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      currencyCode: "USD",
      revenueChangePercent: 0,
      ordersChangePercent: 0,
    },
    revenueSeries: [],
    countrySales: [],
    popularAlbums: [],
    recentOrders: [],
  };
}
