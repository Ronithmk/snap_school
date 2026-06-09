import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { slug } = await params;

  const school = await db.school.findUnique({ where: { slug } });
  if (!school) return err("School not found.", 404);

  const [classCount, albumCount] = await Promise.all([
    db.schoolClass.count({ where: { schoolId: school.id } }),
    db.album.count({ where: { schoolId: school.id } }),
  ]);

  return ok({
    id: school.id,
    slug: school.slug,
    name: school.name,
    logoUrl: school.logoUrl,
    bannerUrl: school.bannerUrl,
    description: school.description,
    status: school.status,
    settings: school.settings,
    classCount,
    albumCount,
    createdAt: school.createdAt.toISOString(),
    updatedAt: school.updatedAt.toISOString(),
  });
}
