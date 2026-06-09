import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

const ALLOWED = ["processing", "completed", "paid"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  const { schoolId } = await params;
  const { orderIds, status } = await req.json();

  if (!orderIds?.length) return err("orderIds required.", 400);
  if (!ALLOWED.includes(status)) return err(`Status must be one of: ${ALLOWED.join(", ")}.`, 400);

  await db.order.updateMany({
    where: { id: { in: orderIds }, schoolId },
    data: { status },
  });

  return ok({ updated: orderIds.length, status });
}
