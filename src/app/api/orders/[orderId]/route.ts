import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtOrder(o: any) {
  let items = o.items;
  let totals = o.totals;
  try { if (typeof items === "string") items = JSON.parse(items); } catch { items = []; }
  try { if (typeof totals === "string") totals = JSON.parse(totals); } catch { totals = {}; }

  let shippingAddress = o.shippingAddress;
  try { if (typeof shippingAddress === "string") shippingAddress = JSON.parse(shippingAddress); } catch { shippingAddress = null; }

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    schoolId: o.schoolId,
    albumId: o.albumId ?? null,
    albumTitle: o.albumTitle ?? null,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status,
    items,
    totals,
    shippingMethodId: o.shippingMethodId ?? null,
    shippingAddress,
    countryCode: o.countryCode ?? null,
    placedAt: o.placedAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { orderId } = await params;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return err("Order not found.", 404);

  return ok(fmtOrder(order));
}
