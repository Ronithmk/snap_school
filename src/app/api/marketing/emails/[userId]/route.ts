import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const { userId } = await params;
  const { marketingOptOut } = await req.json();
  if (typeof marketingOptOut !== "boolean") return err("marketingOptOut must be a boolean.", 400);

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target || target.role !== "parent") return err("Marketing contact not found.", 404);

  const updated = await db.user.update({ where: { id: userId }, data: { marketingOptOut } });
  return ok({ id: updated.id, marketingOptOut: updated.marketingOptOut });
}
