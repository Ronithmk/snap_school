import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  const albums = await db.album.findMany({
    where: { schoolId },
    select: { id: true, title: true, studentId: true },
  });

  const albumIds = albums.map((a) => a.id);
  const albumMap = new Map(albums.map((a) => [a.id, a]));

  const photos = await db.photo.findMany({
    where: {
      albumId: { in: albumIds },
      faceValidationStatus: "flagged",
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  const result = photos.map((photo) => {
    const album = albumMap.get(photo.albumId)!;
    return {
      photo: {
        id: photo.id,
        albumId: photo.albumId,
        previewUrl: photo.previewUrl,
        hdUrl: photo.hdUrl,
        thumbnailUrl: photo.thumbnailUrl,
        width: photo.width,
        height: photo.height,
        fileName: photo.fileName,
        tags: ((photo as any).tags ?? []).map((t: any) => ({ id: t.tag.id, label: t.tag.label })),
        isFavorite: photo.isFavorite,
        faceValidationStatus: photo.faceValidationStatus,
        createdAt: photo.createdAt.toISOString(),
      },
      album: {
        id: album.id,
        title: album.title,
        studentId: album.studentId ?? null,
      },
      reason: "Face does not match album student reference.",
    };
  });

  return ok(result);
}
