import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import { MOCK_ORDERS } from "@/services/mock/orders";
import { MOCK_ALBUMS } from "@/services/mock/albums";
import { MOCK_SCHOOLS } from "@/services/mock/seed-data";
import { COUNTRIES } from "@/config/currency";
import type { AnalyticsOverview, CountrySales, PopularAlbum, RevenuePoint } from "@/types";

const ENDPOINTS = { overview: "/analytics/overview" } as const;

function buildOverview(): AnalyticsOverview {
  const completedOrders = MOCK_ORDERS.filter((o) => !["cancelled", "refunded", "pending_payment"].includes(o.status));
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totals.total, 0);
  const totalOrders = MOCK_ORDERS.length;

  const revenueSeries: RevenuePoint[] = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(2026, 4, i + 1).toISOString().slice(0, 10);
    const dayOrders = completedOrders.filter((o) => o.placedAt.slice(0, 10) === date);
    return {
      date,
      revenue: dayOrders.reduce((sum, o) => sum + o.totals.total, 0),
      orders: dayOrders.length,
    };
  });

  const countrySales: CountrySales[] = COUNTRIES.map((country) => {
    const orders = MOCK_ORDERS.filter((o) => o.countryCode === country.code);
    return {
      countryCode: country.code,
      countryName: country.name,
      revenue: orders.reduce((sum, o) => sum + o.totals.total, 0),
      orders: orders.length,
    };
  })
    .filter((c) => c.orders > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const popularAlbums: PopularAlbum[] = MOCK_ALBUMS.map((album) => {
    const school = MOCK_SCHOOLS.find((s) => s.id === album.schoolId)!;
    const orders = MOCK_ORDERS.filter((o) => o.albumId === album.id);
    return {
      albumId: album.id,
      albumTitle: album.title,
      schoolName: school.name,
      views: 120 + orders.length * 37,
      orders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.totals.total, 0),
    };
  })
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  return {
    summary: {
      totalRevenue,
      totalOrders,
      conversionRate: 4.8,
      averageOrderValue: totalOrders ? totalRevenue / completedOrders.length : 0,
      currencyCode: "USD",
      revenueChangePercent: 12.4,
      ordersChangePercent: 6.1,
    },
    revenueSeries,
    countrySales,
    popularAlbums,
    recentOrders: [...MOCK_ORDERS].sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1)).slice(0, 6),
  };
}

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    if (env.useMockApi) return mockDelay(buildOverview());
    const { data } = await apiClient.get<AnalyticsOverview>(ENDPOINTS.overview);
    return data;
  },
};
