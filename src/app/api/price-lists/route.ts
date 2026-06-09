import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtItem(item: any) {
  return {
    id: item.id,
    priceListId: item.priceListId,
    type: item.type,
    name: item.name,
    amount: item.amount,
    description: item.description ?? null,
    previewImageUrl: item.previewImageUrl ?? null,
    unitsIncluded: item.unitsIncluded ?? null,
  };
}

function fmtPriceList(pl: any) {
  return {
    id: pl.id,
    schoolId: pl.schoolId,
    name: pl.name,
    countryCode: pl.countryCode,
    currencyCode: pl.currencyCode,
    isDefault: pl.isDefault,
    items: (pl.items ?? []).map(fmtItem),
    updatedAt: pl.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  const where: Record<string, any> = {};
  if (schoolId) where.schoolId = schoolId;

  const priceLists = await db.priceList.findMany({
    where,
    include: { items: true },
  });

  return ok(priceLists.map(fmtPriceList));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const body = await req.json();
  const { schoolId, name, countryCode, currencyCode, isDefault, items } = body;

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
            })),
          }
        : undefined,
    },
    include: { items: true },
  });

  return ok(fmtPriceList(priceList), 201);
}
