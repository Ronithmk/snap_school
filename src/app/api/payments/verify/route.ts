import { NextRequest } from "next/server";
import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";
import { fmtOrder } from "@/lib/format-order";

export async function POST(req: NextRequest) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return err("Missing payment verification fields.", 400);
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(body)
    .digest("hex");

  if (expected !== razorpaySignature) {
    return err("Payment signature verification failed.", 400, "invalid_signature");
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      razorpayPaymentId,
    },
    include: { school: true },
  });

  revalidateTag(CACHE_TAGS.analytics, { expire: 0 });

  return ok(fmtOrder(order));
}
