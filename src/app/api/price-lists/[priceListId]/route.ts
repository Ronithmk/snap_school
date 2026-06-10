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
    category: item.category ?? null,
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ priceListId: string }> }) {
  const { priceListId } = await params;

  const priceList = await db.priceList.findUnique({
    where: { id: priceListId },
    include: { items: true },
  });
  if (!priceList) return err("Price list not found.", 404);

  return ok(fmtPriceList(priceList));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ priceListId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { priceListId } = await params;
  const body = await req.json();
  const { name, countryCode, currencyCode, isDefault, items } = body;

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
      })),
    };
  }

  const priceList = await db.priceList.update({
    where: { id: priceListId },
    data,
    include: { items: true },
  });

  return ok(fmtPriceList(priceList));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ priceListId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { priceListId } = await params;

  await db.priceList.delete({ where: { id: priceListId } });

  return new Response(null, { status: 204 });
}
