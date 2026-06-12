import { NextRequest } from "next/server";
import { db, jsonField } from "@/lib/db";
import { ok, err } from "@/lib/api-helpers";
import { getRazorpay } from "@/lib/razorpay-client";

/** Called by anonymous storefront customers choosing "Pay online" — no auth required. */
export async function POST(req: NextRequest) {
  const rzp = getRazorpay();
  if (!rzp) return err("Online payments aren't configured yet.", 501, "razorpay_not_configured");

  const body = await req.json();
  const { schoolId, albumId, customerName, customerEmail, items, totals, shippingMethodId, shippingAddress, countryCode } = body;

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
      paymentMethod: "razorpay",
      items: jsonField(typeof items === "string" ? JSON.parse(items) : items),
      totals: jsonField(typeof totals === "string" ? JSON.parse(totals) : totals),
      shippingMethodId: shippingMethodId ?? null,
      shippingAddress: shippingAddress ? jsonField(typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress) : undefined,
      countryCode: countryCode ?? "IN",
    },
  });

  const rzpOrder = await rzp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: orderNumber,
    notes: { orderId: order.id, schoolId },
  });
  await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } });

  return ok({
    orderId: order.id,
    orderNumber,
    razorpayOrderId: rzpOrder.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? null,
    amount: amountPaise,
    currency: "INR",
    customerName,
    customerEmail,
  }, 201);
}
