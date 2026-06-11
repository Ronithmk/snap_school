import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { formatDbSchool } from "@/lib/format-school";
import { fmtPriceList } from "@/lib/format-price-list";

/**
 * Tags for Next.js Data Cache entries (`unstable_cache` + `revalidateTag`).
 * Each tag groups together the cached queries that back a slice of the app,
 * so the platform-admin "Clear cache" UI can invalidate them independently.
 */
export const CACHE_TAGS = {
  schools: "schools",
  priceLists: "price-lists",
  analytics: "analytics",
  storefront: "storefront",
} as const;

export const CACHE_NAMESPACES: { tag: string; label: string; description: string }[] = [
  {
    tag: CACHE_TAGS.schools,
    label: "Schools",
    description: "School list, names, and class/album counts shown in the platform dashboard.",
  },
  {
    tag: CACHE_TAGS.priceLists,
    label: "Price lists",
    description: "Price lists and items used by the dashboard and storefront checkout.",
  },
  {
    tag: CACHE_TAGS.analytics,
    label: "Analytics",
    description: "Revenue, order, and sales summaries on the dashboard overview.",
  },
  {
    tag: CACHE_TAGS.storefront,
    label: "Storefront pages",
    description: "Public school pages shown to parents and visitors.",
  },
];

// How long a cached entry can be served before Next.js transparently refetches it.
const REVALIDATE_SECONDS = 60;

export const getCachedSchools = unstable_cache(
  async () => {
    const schools = await db.school.findMany({ orderBy: { name: "asc" } });
    const classes = await db.schoolClass.groupBy({ by: ["schoolId"], _count: true });
    const albums = await db.album.groupBy({ by: ["schoolId"], _count: true });
    const classMap = Object.fromEntries(classes.map((c) => [c.schoolId, c._count]));
    const albumMap = Object.fromEntries(albums.map((a) => [a.schoolId, a._count]));
    return schools.map((s) =>
      formatDbSchool(s, { classCount: classMap[s.id] ?? 0, albumCount: albumMap[s.id] ?? 0 }),
    );
  },
  ["schools-list"],
  { tags: [CACHE_TAGS.schools], revalidate: REVALIDATE_SECONDS },
);

export const getCachedSchoolBySlug = unstable_cache(
  async (slug: string) => {
    const school = await db.school.findUnique({ where: { slug } });
    if (!school) return null;
    const [classCount, albumCount] = await Promise.all([
      db.schoolClass.count({ where: { schoolId: school.id } }),
      db.album.count({ where: { schoolId: school.id } }),
    ]);
    return formatDbSchool(school, { classCount, albumCount });
  },
  ["school-by-slug"],
  { tags: [CACHE_TAGS.storefront], revalidate: REVALIDATE_SECONDS },
);

export const getCachedPriceLists = unstable_cache(
  async (schoolId: string | null) => {
    const where: Record<string, unknown> = {};
    if (schoolId) where.schoolId = schoolId;
    const priceLists = await db.priceList.findMany({ where, include: { items: true } });
    return priceLists.map(fmtPriceList);
  },
  ["price-lists"],
  { tags: [CACHE_TAGS.priceLists], revalidate: REVALIDATE_SECONDS },
);

const ACTIVE_STATUSES = ["pending_payment", "cancelled", "refunded"];

/**
 * Pre-computes the dataset behind /api/analytics/overview as plain JSON
 * (dates as ISO strings) so it survives the Data Cache's serialize/deserialize
 * round trip. Per-role filtering by schoolId happens after this returns.
 */
export const getCachedAnalyticsData = unstable_cache(
  async () => {
    const orders = await db.order.findMany({ include: { school: true }, orderBy: { placedAt: "desc" } });
    const albums = await db.album.findMany({ include: { school: true } });

    return {
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        schoolId: o.schoolId,
        schoolName: o.school?.name ?? "",
        albumId: o.albumId ?? null,
        albumTitle: o.albumTitle ?? "",
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        status: o.status,
        items: o.items,
        totals: o.totals,
        shippingMethodId: o.shippingMethodId ?? null,
        shippingAddress: o.shippingAddress,
        countryCode: o.countryCode ?? null,
        placedAt: o.placedAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
      albums: albums.map((a) => ({
        id: a.id,
        schoolId: a.schoolId,
        title: a.title,
        schoolName: a.school?.name ?? "",
      })),
    };
  },
  ["analytics-data"],
  { tags: [CACHE_TAGS.analytics], revalidate: REVALIDATE_SECONDS },
);

export { ACTIVE_STATUSES };
