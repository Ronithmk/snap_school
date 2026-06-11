import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, parseIntParam, paginate } from "@/lib/api-helpers";

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
    schoolName: o.school?.name ?? "",
    albumId: o.albumId ?? null,
    albumTitle: o.albumTitle ?? "",
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
