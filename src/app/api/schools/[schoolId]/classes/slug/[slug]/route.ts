import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtClass(c: any, albumCount = 0) {
  return {
    id: c.id,
    schoolId: c.schoolId,
    name: c.name,
    slug: c.slug,
    grouping: c.grouping,
    studentCount: c.studentCount,
    priceListId: c.priceListId ?? null,
    albumCount,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; slug: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId, slug } = await params;

  const cls = await db.schoolClass.findFirst({ where: { schoolId, slug } });
  if (!cls) return err("Class not found.", 404);

  const albumCount = await db.album.count({ where: { classId: cls.id } });

  return ok(fmtClass(cls, albumCount));
}
