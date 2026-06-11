import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

/**
 * Product Lab has no server-side rendering pipeline yet, so "export" returns the
 * product's existing preview image as a best-effort download/preview link.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { productId } = await params;

  const product = await db.labProduct.findUnique({ where: { id: productId } });
  if (!product) return err("Product not found.", 404);

  const url = product.previewImageUrl || "/file.svg";

  return ok({ url });
}
