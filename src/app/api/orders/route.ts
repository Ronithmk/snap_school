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
    albumId: o.albumId ?? null,
    albumTitle: o.albumTitle ?? null,
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
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  const where: Record<string, any> = {};
  if (schoolId) where.schoolId = schoolId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { orderNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const orders = await db.order.findMany({ where, orderBy: { placedAt: "desc" } });

  const formatted = orders.map(fmtOrder);
  return ok(paginate(formatted, page, pageSize));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const body = await req.json();
  const {
    schoolId,
    albumId,
    albumTitle,
    customerName,
    customerEmail,
    status,
    items,
    totals,
    shippingMethodId,
    shippingAddress,
    countryCode,
  } = body;

  if (!schoolId || !customerName || !customerEmail) {
    return err("schoolId, customerName, and customerEmail are required.", 400);
  }

  const orderNumber = `SS-${Date.now()}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      schoolId,
      albumId: albumId ?? null,
      albumTitle: albumTitle ?? null,
      customerName,
      customerEmail,
      status: status ?? "pending",
      items: typeof items === "object" ? items : JSON.parse(items ?? "[]"),
      totals: typeof totals === "object" ? totals : JSON.parse(totals ?? "{}"),
      shippingMethodId: shippingMethodId ?? null,
      shippingAddress: shippingAddress ?? undefined,
      countryCode: countryCode ?? "IN",
    },
  });

  return ok(fmtOrder(order), 201);
}
