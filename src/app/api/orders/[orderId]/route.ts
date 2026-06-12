import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";
import { fmtOrder } from "@/lib/format-order";
import { CANCELLABLE_ORDER_STATUSES } from "@/config/constants";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { orderId } = await params;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { school: true } });
  if (!order) return err("Order not found.", 404);
  if (!canManageSchool(user, order.schoolId)) return err("Unauthorized.", 403);

  return ok(fmtOrder(order));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { orderId } = await params;
  const { status } = await req.json();

  if (status !== "cancelled") return err("Only cancelling an order is supported.", 400);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return err("Order not found.", 404);

  if (user.role !== "platform_admin" && !(user.schoolIds ?? []).includes(order.schoolId)) {
    return err("Unauthorized.", 403);
  }

  if (!(CANCELLABLE_ORDER_STATUSES as string[]).includes(order.status)) {
    return err(`Orders with status "${order.status}" cannot be cancelled.`, 400);
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
    include: { school: true },
  });

  revalidateTag(CACHE_TAGS.analytics, { expire: 0 });

  return ok(fmtOrder(updated));
}
