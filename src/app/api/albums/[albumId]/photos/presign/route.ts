import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { ok, err } from "@/lib/api-helpers";
import { sanitizeFileName } from "@/lib/image";
import { presignUpload, STORAGE_CONFIGURED } from "@/lib/r2";

interface PresignRequest {
  fileName: string;
  contentType: string;
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
  const files = body?.files as PresignRequest[] | undefined;
  if (!Array.isArray(files) || files.length === 0) return err("files must be a non-empty array.", 400);

  const timestamp = Date.now();
  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const baseName = sanitizeFileName(file.fileName.replace(/\.[^.]+$/, ""));
      const ext = file.fileName.split(".").pop() || "bin";
      const key = `albums/${albumId}/incoming/${timestamp}-${index}-${baseName}.${ext}`;
      const uploadUrl = await presignUpload(key, file.contentType || "application/octet-stream");
      return { key, uploadUrl, fileName: file.fileName };
    }),
  );

  return ok({ uploads });
}
