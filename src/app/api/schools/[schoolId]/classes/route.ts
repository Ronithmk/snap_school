import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";
import { ensureStagingAlbum } from "@/lib/staging-album";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  const classes = await db.schoolClass.findMany({ where: { schoolId } });

  const result = await Promise.all(
    classes.map(async (c) => {
      const albumCount = await db.album.count({ where: { classId: c.id, isStaging: false } });
      const staging = await db.album.findFirst({ where: { classId: c.id, isStaging: true } });
      return fmtClass(c, albumCount, staging?.id ?? null);
    })
  );

  return ok(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;
  const body = await req.json();
  const { name, slug, grouping, studentCount, priceListId } = body;

  if (!name || !slug) return err("name and slug are required.", 400);

  const existing = await db.schoolClass.findFirst({ where: { schoolId, slug } });
  if (existing) return err("A class with this slug already exists in this school.", 409);

  const newClass = await db.schoolClass.create({
    data: {
      schoolId,
      name,
      slug,
      grouping: grouping ?? null,
      studentCount: studentCount ?? 0,
      priceListId: priceListId ?? null,
    },
  });

  const staging = await ensureStagingAlbum(newClass.id);

  revalidateTag(CACHE_TAGS.schools, { expire: 0 });

  return ok(fmtClass(newClass, 0, staging?.id ?? null), 201);
}
