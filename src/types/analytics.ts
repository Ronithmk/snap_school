import type { ID, ISODateString } from "./common";
import type { Order } from "./order";

export interface RevenuePoint {
  date: ISODateString;
  revenue: number;
  orders: number;
}

export interface CountrySales {
  countryCode: string;
  countryName: string;
  revenue: number;
  orders: number;
}

export interface PopularAlbum {
  albumId: ID;
  albumTitle: string;
  schoolName: string;
  views: number;
  orders: number;
  revenue: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  currencyCode: string;
  revenueChangePercent: number;
  ordersChangePercent: number;
}

export interface AnalyticsOverview {
  summary: AnalyticsSummary;
  revenueSeries: RevenuePoint[];
  countrySales: CountrySales[];
  popularAlbums: PopularAlbum[];
  recentOrders: Order[];
}
