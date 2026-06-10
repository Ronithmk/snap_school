import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, parseIntParam, paginate } from "@/lib/api-helpers";
import { processImage, sanitizeFileName } from "@/lib/image";
import { uploadToR2, R2_PUBLIC_URL } from "@/lib/r2";

// Fallback to local storage if R2 is not configured
import fs from "fs";
import path from "path";

const USE_R2 = !!process.env.R2_ACCOUNT_ID;

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 24);

  const photos = await db.photo.findMany({
    where: { albumId },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "asc" },
  });

  return ok(paginate(photos.map(fmtPhoto), page, pageSize));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;
  const album = await db.album.findUnique({ where: { id: albumId } });
  if (!album) return err("Album not found.", 404);

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) return err("No files uploaded.", 400);

  const faceValidationStatus = album.studentId ? "pending" : "skipped";
  const createdPhotos: any[] = [];

  for (const file of files) {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
    const timestamp = Date.now();

    let thumbnailUrl: string;
    let previewUrl: string;
    let hdUrl: string;
    let width = 0;
    let height = 0;

    try {
      const processed = await processImage(rawBuffer);
      width = processed.width;
      height = processed.height;

      if (USE_R2) {
        [thumbnailUrl, previewUrl, hdUrl] = await Promise.all([
          uploadToR2(`albums/${albumId}/${baseName}-${timestamp}-thumb.webp`, processed.thumbnail, "image/webp"),
          uploadToR2(`albums/${albumId}/${baseName}-${timestamp}-preview.webp`, processed.preview, "image/webp"),
          uploadToR2(`albums/${albumId}/${baseName}-${timestamp}-hd.webp`, processed.hd, "image/webp"),
        ]);
      } else {
        const uploadDir = path.join(process.cwd(), "public", "uploads", albumId);
        fs.mkdirSync(uploadDir, { recursive: true });
        const writeAndGetUrl = (suffix: string, buf: Buffer) => {
          const fileName = `${baseName}-${timestamp}-${suffix}.webp`;
          fs.writeFileSync(path.join(uploadDir, fileName), buf);
          return `/uploads/${albumId}/${fileName}`;
        };
        thumbnailUrl = writeAndGetUrl("thumb", processed.thumbnail);
        previewUrl = writeAndGetUrl("preview", processed.preview);
        hdUrl = writeAndGetUrl("hd", processed.hd);
      }
    } catch {
      // Fallback: store original file without processing
      if (USE_R2) {
        const key = `albums/${albumId}/${baseName}-${timestamp}.${file.name.split(".").pop()}`;
        const url = await uploadToR2(key, rawBuffer, file.type || "image/jpeg");
        thumbnailUrl = previewUrl = hdUrl = url;
      } else {
        const uploadDir = path.join(process.cwd(), "public", "uploads", albumId);
        fs.mkdirSync(uploadDir, { recursive: true });
        const fileName = `${baseName}-${timestamp}.${file.name.split(".").pop()}`;
        fs.writeFileSync(path.join(uploadDir, fileName), rawBuffer);
        thumbnailUrl = previewUrl = hdUrl = `/uploads/${albumId}/${fileName}`;
      }
    }

    const photo = await db.photo.create({
      data: {
        albumId,
        previewUrl,
        hdUrl,
        thumbnailUrl,
        width,
        height,
        fileName: file.name,
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
