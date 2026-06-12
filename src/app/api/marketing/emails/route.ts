import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, paginate, parseIntParam } from "@/lib/api-helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtEntry(u: any) {
  const schoolNames = Array.from(
    new Set(u.parentLinks.map((link: any) => link.student?.school?.name).filter(Boolean)), // eslint-disable-line @typescript-eslint/no-explicit-any
  ) as string[];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    schoolNames,
    marketingOptOut: u.marketingOptOut,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const schoolId = searchParams.get("schoolId");
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  const where: Record<string, unknown> = { role: "parent" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (schoolId) {
    where.parentLinks = { some: { student: { schoolId } } };
  }

  const users = await db.user.findMany({
    where,
    include: { parentLinks: { include: { student: { include: { school: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const entries = users.map(fmtEntry);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stats = {
    total: entries.length,
    optedOut: entries.filter((e) => e.marketingOptOut).length,
    last30Days: entries.filter((e) => new Date(e.createdAt) >= thirtyDaysAgo).length,
  };

  return ok({ ...paginate(entries, page, pageSize), stats });
}
