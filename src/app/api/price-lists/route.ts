import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { fmtPriceList } from "@/lib/format-price-list";
import { CACHE_TAGS, getCachedPriceLists } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  const priceLists = await getCachedPriceLists(schoolId);

  return ok(priceLists);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const body = await req.json();
  const { schoolId, name, countryCode, currencyCode, isDefault, items, bulkDiscounts } = body;

  if (!schoolId || !name) return err("schoolId and name are required.", 400);

  const priceList = await db.priceList.create({
    data: {
      schoolId,
      name,
      countryCode: countryCode ?? "",
      currencyCode: currencyCode ?? "",
      isDefault: isDefault ?? false,
      items: items && items.length > 0
        ? {
            create: items.map((item: any) => ({
              type: item.type,
              name: item.name,
              amount: item.amount,
              description: item.description ?? null,
              previewImageUrl: item.previewImageUrl ?? null,
              unitsIncluded: item.unitsIncluded ?? null,
              category: item.category ?? null,
            })),
          }
        : undefined,
      bulkDiscounts: bulkDiscounts && bulkDiscounts.length > 0
        ? {
            create: bulkDiscounts.map((tier: any) => ({
              minQuantity: tier.minQuantity,
              discountPercent: tier.discountPercent,
            })),
          }
        : undefined,
    },
    include: { items: true, bulkDiscounts: true },
  });

  revalidateTag(CACHE_TAGS.priceLists, { expire: 0 });

  return ok(fmtPriceList(priceList), 201);
}
