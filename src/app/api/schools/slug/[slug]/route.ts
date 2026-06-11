import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-helpers";
import { formatDbSchool } from "@/lib/format-school";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const school = await db.school.findUnique({ where: { slug } });
  if (!school) return err("School not found.", 404);

  const [classCount, albumCount] = await Promise.all([
    db.schoolClass.count({ where: { schoolId: school.id } }),
    db.album.count({ where: { schoolId: school.id } }),
  ]);

  return ok(formatDbSchool(school, { classCount, albumCount }));
}
