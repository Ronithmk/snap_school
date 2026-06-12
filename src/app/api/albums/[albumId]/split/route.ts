import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";
import { uniqueAlbumSlug } from "@/lib/staging-album";

interface SplitGroup {
  title: string;
  photoIds: string[];
  coverPhotoId?: string;
  studentId?: string | null;
}

function fmtAlbum(a: any) {
  return {
    id: a.id,
    schoolId: a.schoolId,
    classId: a.classId ?? null,
    studentId: a.studentId ?? null,
    title: a.title,
    slug: a.slug,
    description: a.description,
    coverImageUrl: a.coverImageUrl,
    visibility: a.visibility,
    passwordProtected: !!a.passwordHash,
    shareUrl: a.shareUrl,
    pricing: { priceListId: a.priceListId ?? null, currencyCode: "" },
    photoCount: a.photoCount,
    flaggedCount: a.flaggedCount,
    isStaging: !!a.isStaging,
    eventDate: a.eventDate?.toISOString() ?? undefined,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;
  const sourceAlbum = await db.album.findUnique({ where: { id: albumId } });
  if (!sourceAlbum) return err("Album not found.", 404);

  const school = await db.school.findUnique({ where: { id: sourceAlbum.schoolId } });
  if (!school) return err("School not found.", 404);

  const body = await req.json();
  const groups = body?.groups as SplitGroup[] | undefined;
  if (!Array.isArray(groups) || groups.length === 0) {
    return err("groups must be a non-empty array.", 400);
  }

  const createdAlbums: any[] = [];
  let totalMoved = 0;

  for (const group of groups) {
    if (!group.title || !Array.isArray(group.photoIds) || group.photoIds.length === 0) continue;

    const slug = await uniqueAlbumSlug(sourceAlbum.schoolId, group.title);

    let coverImageUrl = "";
    if (group.coverPhotoId) {
      const coverPhoto = await db.photo.findUnique({ where: { id: group.coverPhotoId } });
      coverImageUrl = coverPhoto?.previewUrl ?? "";
    }
    if (!coverImageUrl) {
      const firstPhoto = await db.photo.findUnique({ where: { id: group.photoIds[0] } });
      coverImageUrl = firstPhoto?.previewUrl ?? "";
    }

    const album = await db.album.create({
      data: {
        schoolId: sourceAlbum.schoolId,
        classId: sourceAlbum.classId,
        studentId: group.studentId ?? null,
        title: group.title,
        slug,
        coverImageUrl,
        visibility: "private",
        shareUrl: "",
        photoCount: group.photoIds.length,
        flaggedCount: 0,
      },
    });

    const updated = await db.album.update({
      where: { id: album.id },
      data: { shareUrl: `/${school.slug}/album/${album.id}` },
    });

    const moved = await db.photo.updateMany({
      where: { id: { in: group.photoIds }, albumId: sourceAlbum.id },
      data: { albumId: album.id },
    });

    totalMoved += moved.count;
    createdAlbums.push(fmtAlbum(updated));
  }

  if (totalMoved > 0) {
    await db.album.update({
      where: { id: sourceAlbum.id },
      data: { photoCount: { decrement: totalMoved } },
    });
  }

  revalidateTag(CACHE_TAGS.schools, { expire: 0 });

  return ok({ albums: createdAlbums });
}
