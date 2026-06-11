import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { fmtOrder } from "@/lib/format-order";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { orderId } = await params;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { school: true } });
  if (!order) return err("Order not found.", 404);

  return ok(fmtOrder(order));
}
