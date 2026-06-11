import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { fmtLabProduct } from "@/lib/format-lab-product";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { productId } = await params;

  const product = await db.labProduct.findUnique({ where: { id: productId } });
  if (!product) return err("Product not found.", 404);

  return ok(fmtLabProduct(product));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { productId } = await params;
  const body = await req.json();
  const { name, description, type, category, dimensions, orientation, price, currencyCode, taxIncluded, tags, status, previewImageUrl, pages } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (type !== undefined) data.type = type;
  if (category !== undefined) data.category = category;
  if (dimensions !== undefined) data.dimensions = JSON.stringify(dimensions);
  if (orientation !== undefined) data.orientation = orientation;
  if (price !== undefined) data.price = price;
  if (currencyCode !== undefined) data.currencyCode = currencyCode;
  if (taxIncluded !== undefined) data.taxIncluded = taxIncluded;
  if (tags !== undefined) data.tags = JSON.stringify(tags);
  if (status !== undefined) data.status = status;
  if (previewImageUrl !== undefined) data.previewImageUrl = previewImageUrl;
  if (pages !== undefined) data.pages = JSON.stringify(pages);

  const product = await db.labProduct.update({ where: { id: productId }, data });

  return ok(fmtLabProduct(product));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { productId } = await params;

  await db.labProduct.delete({ where: { id: productId } });

  return new Response(null, { status: 204 });
}
