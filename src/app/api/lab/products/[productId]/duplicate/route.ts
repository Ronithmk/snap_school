import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { fmtLabProduct } from "@/lib/format-lab-product";

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { productId } = await params;

  const existing = await db.labProduct.findUnique({ where: { id: productId } });
  if (!existing) return err("Product not found.", 404);

  const copy = await db.labProduct.create({
    data: {
      schoolId: existing.schoolId,
      name: `${existing.name} (copy)`,
      description: existing.description,
      type: existing.type,
      category: existing.category,
      status: "draft",
      previewImageUrl: existing.previewImageUrl,
      dimensions: existing.dimensions,
      orientation: existing.orientation,
      price: existing.price,
      currencyCode: existing.currencyCode,
      taxIncluded: existing.taxIncluded,
      tags: existing.tags,
      pages: existing.pages,
    },
  });

  return ok(fmtLabProduct(copy), 201);
}
