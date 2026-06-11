import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, parseIntParam, paginate } from "@/lib/api-helpers";
import { fmtOrder } from "@/lib/format-order";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "parent") return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return err("Unauthorized.", 401);

  const orders = await db.order.findMany({
    where: { customerEmail: dbUser.email },
    include: { school: true },
    orderBy: { placedAt: "desc" },
  });

  const formatted = orders.map(fmtOrder);
  return ok(paginate(formatted, page, pageSize));
}
