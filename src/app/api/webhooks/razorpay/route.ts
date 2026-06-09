import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const { event: eventType, payload } = event;

  if (eventType === "payment.captured") {
    const payment = payload?.payment?.entity;
    const notes = payment?.notes ?? {};
    const orderId = notes?.orderId;
    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "paid", razorpayPaymentId: payment.id },
      });
    }
  }

  if (eventType === "payment.failed") {
    const payment = payload?.payment?.entity;
    const notes = payment?.notes ?? {};
    const orderId = notes?.orderId;
    if (orderId) {
      await db.order.update({ where: { id: orderId }, data: { status: "payment_failed" } });
    }
  }

  return NextResponse.json({ received: true });
}
