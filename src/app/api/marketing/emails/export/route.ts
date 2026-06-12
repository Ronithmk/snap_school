import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { err } from "@/lib/api-helpers";

function csvEscape(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const users = await db.user.findMany({
    where: { role: "parent" },
    include: { parentLinks: { include: { student: { include: { school: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const header = "Name,Email,Schools,Opted Out,Signed Up";
  const rows = users.map((u) => {
    const schoolNames = Array.from(
      new Set(u.parentLinks.map((link) => link.student?.school?.name).filter(Boolean)),
    );
    return [u.name, u.email, schoolNames.join("; "), u.marketingOptOut ? "Yes" : "No", u.createdAt.toISOString()]
      .map(csvEscape)
      .join(",");
  });
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="marketing-emails-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
