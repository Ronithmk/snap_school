import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db, jsonField } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, parseIntParam, paginate } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";
import { fmtOrder, buildOrdersWhere } from "@/lib/format-order";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  const where = buildOrdersWhere(user, { schoolId, status, search });
  if ("__unauthorized" in where) return err("Unauthorized.", 403);

  const orders = await db.order.findMany({ where, include: { school: true }, orderBy: { placedAt: "desc" } });

  const formatted = orders.map(fmtOrder);
  return ok(paginate(formatted, page, pageSize));
}

/** Placed by anonymous storefront customers at checkout — no auth required. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    schoolId,
    albumId,
    albumTitle,
    customerName,
    customerEmail,
    items,
    totals,
    shippingMethodId,
    shippingAddress,
    countryCode,
    paymentMethod,
  } = body;

  if (!schoolId || !customerName || !customerEmail) {
    return err("schoolId, customerName, and customerEmail are required.", 400);
  }

  const orderNumber = `SS-${Date.now()}`;
  const isCod = paymentMethod === "cod";

  const order = await db.order.create({
    data: {
      orderNumber,
      schoolId,
      albumId: albumId ?? null,
      albumTitle: albumTitle ?? "",
      customerName,
      customerEmail,
      status: isCod ? "cod" : "pending_payment",
      paymentMethod: isCod ? "cod" : "razorpay",
      items: jsonField(typeof items === "object" ? items : JSON.parse(items ?? "[]")),
      totals: jsonField(typeof totals === "object" ? totals : JSON.parse(totals ?? "{}")),
      shippingMethodId: shippingMethodId ?? null,
      shippingAddress: shippingAddress != null ? jsonField(shippingAddress) : undefined,
      countryCode: countryCode ?? "IN",
    },
    include: { school: true },
  });

  revalidateTag(CACHE_TAGS.analytics, { expire: 0 });

  return ok(fmtOrder(order), 201);
}
