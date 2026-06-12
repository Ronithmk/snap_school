import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { ok, err } from "@/lib/api-helpers";

function fmtPhoto(p: any) {
  return {
    id: p.id,
    albumId: p.albumId,
    previewUrl: p.previewUrl,
    hdUrl: p.hdUrl,
    thumbnailUrl: p.thumbnailUrl,
    width: p.width,
    height: p.height,
    fileName: p.fileName,
    tags: (p.tags ?? []).map((t: any) => ({ id: t.tag.id, label: t.tag.label })),
    isFavorite: p.isFavorite,
    faceValidationStatus: p.faceValidationStatus,
    category: p.category ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await params;

  const photo = await db.photo.findUnique({
    where: { id: photoId },
    include: { tags: { include: { tag: true } } },
  });
  if (!photo) return err("Photo not found.", 404);

  return ok(fmtPhoto(photo));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ photoId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { photoId } = await params;
  const body = await req.json();
  const { category } = body;

  const photo = await db.photo.findUnique({ where: { id: photoId }, include: { album: true } });
  if (!photo) return err("Photo not found.", 404);
  if (!canManageSchool(user, photo.album.schoolId)) return err("Unauthorized.", 403);

  const updated = await db.photo.update({
    where: { id: photoId },
    data: { category: category || null },
    include: { tags: { include: { tag: true } } },
  });

  return ok(fmtPhoto(updated));
}
