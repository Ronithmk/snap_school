import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";

function fmtClass(c: any, albumCount = 0, stagingAlbumId: string | null = null) {
  return {
    id: c.id,
    schoolId: c.schoolId,
    name: c.name,
    slug: c.slug,
    grouping: c.grouping,
    studentCount: c.studentCount,
    priceListId: c.priceListId ?? null,
    albumCount,
    stagingAlbumId,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { classId } = await params;

  const cls = await db.schoolClass.findUnique({ where: { id: classId } });
  if (!cls) return err("Class not found.", 404);

  const albumCount = await db.album.count({ where: { classId, isStaging: false } });
  const staging = await db.album.findFirst({ where: { classId, isStaging: true } });

  return ok(fmtClass(cls, albumCount, staging?.id ?? null));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { classId } = await params;
  const body = await req.json();
  const { name, slug, grouping, studentCount, priceListId } = body;

  const data: Record<string, any> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (grouping !== undefined) data.grouping = grouping;
  if (studentCount !== undefined) data.studentCount = studentCount;
  if (priceListId !== undefined) data.priceListId = priceListId;

  const cls = await db.schoolClass.update({ where: { id: classId }, data });

  const albumCount = await db.album.count({ where: { classId, isStaging: false } });
  const staging = await db.album.findFirst({ where: { classId, isStaging: true } });

  return ok(fmtClass(cls, albumCount, staging?.id ?? null));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { classId } = await params;

  await db.schoolClass.delete({ where: { id: classId } });

  revalidateTag(CACHE_TAGS.schools, { expire: 0 });

  return new Response(null, { status: 204 });
}
