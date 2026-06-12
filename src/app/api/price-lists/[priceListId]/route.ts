import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { ok, err } from "@/lib/api-helpers";
import { fmtPriceList } from "@/lib/format-price-list";
import { CACHE_TAGS } from "@/lib/cache";

export async function GET(req: NextRequest, { params }: { params: Promise<{ priceListId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { priceListId } = await params;

  const priceList = await db.priceList.findUnique({
    where: { id: priceListId },
    include: { items: true, bulkDiscounts: true },
  });
  if (!priceList) return err("Price list not found.", 404);
  if (!canManageSchool(user, priceList.schoolId)) return err("Unauthorized.", 403);

  return ok(fmtPriceList(priceList));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ priceListId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { priceListId } = await params;

  const existing = await db.priceList.findUnique({ where: { id: priceListId } });
  if (!existing) return err("Price list not found.", 404);
  if (!canManageSchool(user, existing.schoolId)) return err("Unauthorized.", 403);

  const body = await req.json();
  const { name, countryCode, currencyCode, isDefault, items, bulkDiscounts } = body;

  const data: Record<string, any> = {};
  if (name !== undefined) data.name = name;
  if (countryCode !== undefined) data.countryCode = countryCode;
  if (currencyCode !== undefined) data.currencyCode = currencyCode;
  if (isDefault !== undefined) data.isDefault = isDefault;

  if (items !== undefined) {
    await db.priceListItem.deleteMany({ where: { priceListId } });
    data.items = {
      create: items.map((item: any) => ({
        type: item.type,
        name: item.name,
        amount: item.amount,
        description: item.description ?? null,
        previewImageUrl: item.previewImageUrl ?? null,
        unitsIncluded: item.unitsIncluded ?? null,
        category: item.category ?? null,
        productType: item.productType ?? null,
      })),
    };
  }

  if (bulkDiscounts !== undefined) {
    await db.bulkDiscountTier.deleteMany({ where: { priceListId } });
    data.bulkDiscounts = {
      create: bulkDiscounts.map((tier: any) => ({
        minQuantity: tier.minQuantity,
        discountPercent: tier.discountPercent,
      })),
    };
  }

  const priceList = await db.priceList.update({
    where: { id: priceListId },
    data,
    include: { items: true, bulkDiscounts: true },
  });

  revalidateTag(CACHE_TAGS.priceLists, { expire: 0 });

  return ok(fmtPriceList(priceList));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ priceListId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { priceListId } = await params;

  const existing = await db.priceList.findUnique({ where: { id: priceListId } });
  if (!existing) return err("Price list not found.", 404);
  if (!canManageSchool(user, existing.schoolId)) return err("Unauthorized.", 403);

  await db.priceList.delete({ where: { id: priceListId } });

  revalidateTag(CACHE_TAGS.priceLists, { expire: 0 });

  return new Response(null, { status: 204 });
}
