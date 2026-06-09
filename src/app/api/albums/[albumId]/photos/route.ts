import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, parseIntParam, paginate } from "@/lib/api-helpers";

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
    createdAt: p.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 24);

  const photos = await db.photo.findMany({
    where: { albumId },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const formatted = photos.map(fmtPhoto);
  return ok(paginate(formatted, page, pageSize));
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

  const uploadDir = path.join(process.cwd(), "public", "uploads", albumId);
  fs.mkdirSync(uploadDir, { recursive: true });

  const faceValidationStatus = album.studentId ? "pending" : "skipped";
  const createdPhotos: any[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${albumId}/${fileName}`;

    const photo = await db.photo.create({
      data: {
        albumId,
        previewUrl: fileUrl,
        hdUrl: fileUrl,
        thumbnailUrl: fileUrl,
        width: 0,
        height: 0,
        fileName,
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
