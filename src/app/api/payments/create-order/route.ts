import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { getRazorpay } from "@/lib/razorpay-client";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  const body = await req.json();
  const { schoolId, albumId, customerName, customerEmail, items, totals, shippingAddress, countryCode } = body;

  if (!schoolId || !customerName || !customerEmail || !items || !totals) {
    return err("Missing required order fields.", 400);
  }

  const amountPaise = Math.round((totals.grandTotal ?? totals.total ?? 0) * 100);
  if (amountPaise < 100) return err("Order total must be at least ₹1.", 400);

  const orderNumber = `SS-${Date.now()}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      schoolId,
      albumId: albumId ?? null,
      albumTitle: body.albumTitle ?? "",
      customerName,
      customerEmail,
      status: "pending_payment",
      items: typeof items === "string" ? items : JSON.stringify(items),
      totals: typeof totals === "string" ? totals : JSON.stringify(totals),
      shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
      countryCode: countryCode ?? "IN",
    },
  });

  let razorpayOrderId: string | null = null;
  const rzp = getRazorpay();
  if (rzp) {
    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: orderNumber,
      notes: { orderId: order.id, schoolId },
    });
    razorpayOrderId = rzpOrder.id;
    await db.order.update({ where: { id: order.id }, data: { razorpayOrderId } });
  }

  return ok({
    orderId: order.id,
    orderNumber,
    razorpayOrderId,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? null,
    amount: amountPaise,
    currency: "INR",
    customerName,
    customerEmail,
  }, 201);
}
