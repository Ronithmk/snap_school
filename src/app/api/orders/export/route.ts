import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { err } from "@/lib/api-helpers";
import { fmtOrder, buildOrdersWhere } from "@/lib/format-order";

function csvEscape(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where = buildOrdersWhere(user, { schoolId, status, search });
  if ("__unauthorized" in where) return err("Unauthorized.", 403);

  const orders = await db.order.findMany({ where, include: { school: true }, orderBy: { placedAt: "desc" } });
  const formatted = orders.map(fmtOrder);

  const header = "Order Number,School,Album,Customer,Status,Total,Currency,Placed At";
  const rows = formatted.map((o) =>
    [o.orderNumber, o.schoolName, o.albumTitle, o.customerName, o.status, o.totals.total, o.totals.currencyCode, o.placedAt]
      .map(csvEscape)
      .join(","),
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
