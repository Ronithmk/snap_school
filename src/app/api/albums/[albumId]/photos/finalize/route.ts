import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { ok, err } from "@/lib/api-helpers";
import { processImage } from "@/lib/image";
import { fmtPhoto } from "@/lib/format-photo";
import { uploadToR2, downloadFromR2, deleteFromR2, STORAGE_CONFIGURED } from "@/lib/r2";

export const maxDuration = 60;

interface FinalizeUpload {
  key: string;
  fileName: string;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  if (!STORAGE_CONFIGURED) return err("Direct uploads aren't configured.", 501, "storage_not_configured");

  const { albumId } = await params;
  const album = await db.album.findUnique({ where: { id: albumId } });
  if (!album) return err("Album not found.", 404);
  if (!canManageSchool(user, album.schoolId)) return err("Unauthorized.", 403);

  const body = await req.json().catch(() => null);
  const uploads = body?.uploads as FinalizeUpload[] | undefined;
  if (!Array.isArray(uploads) || uploads.length === 0) return err("uploads must be a non-empty array.", 400);

  const faceValidationStatus = album.studentId ? "pending" : "skipped";
  const createdPhotos: any[] = [];

  for (const upload of uploads) {
    const rawBuffer = await downloadFromR2(upload.key);
    const baseName = upload.key.split("/").pop()!.replace(/\.[^.]+$/, "");

    const processed = await processImage(rawBuffer);
    const [thumbnailUrl, previewUrl, hdUrl] = await Promise.all([
      uploadToR2(`albums/${albumId}/${baseName}-thumb.webp`, processed.thumbnail, "image/webp"),
      uploadToR2(`albums/${albumId}/${baseName}-preview.webp`, processed.preview, "image/webp"),
      uploadToR2(`albums/${albumId}/${baseName}-hd.webp`, processed.hd, "image/webp"),
    ]);

    await deleteFromR2(upload.key);

    const photo = await db.photo.create({
      data: {
        albumId,
        previewUrl,
        hdUrl,
        thumbnailUrl,
        width: processed.width,
        height: processed.height,
        fileName: upload.fileName,
        isFavorite: false,
        faceValidationStatus,
      },
    });

    createdPhotos.push({ ...photo, tags: [] });
  }

  await db.album.update({
    where: { id: albumId },
    data: { photoCount: { increment: createdPhotos.length } },
  });

  return ok({ photos: createdPhotos.map(fmtPhoto), flaggedCount: 0 }, 201);
}
