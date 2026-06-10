import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

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
    eventDate: a.eventDate?.toISOString() ?? undefined,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;

  const album = await db.album.findUnique({ where: { id: albumId } });
  if (!album) return err("Album not found.", 404);

  return ok(fmtAlbum(album));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;
  const body = await req.json();
  const {
    title,
    slug,
    classId,
    studentId,
    description,
    visibility,
    password,
    priceListId,
    eventDate,
    coverImageUrl,
  } = body;

  const data: Record<string, any> = {};
  if (title !== undefined) data.title = title;
  if (slug !== undefined) data.slug = slug;
  if (classId !== undefined) data.classId = classId;
  if (studentId !== undefined) data.studentId = studentId;
  if (description !== undefined) data.description = description;
  if (visibility !== undefined) data.visibility = visibility;
  if (priceListId !== undefined) data.priceListId = priceListId;
  if (eventDate !== undefined) data.eventDate = eventDate ? new Date(eventDate) : null;
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;

  if (password === "") {
    data.passwordHash = null;
  } else if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const album = await db.album.update({ where: { id: albumId }, data });

  return ok(fmtAlbum(album));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;

  await db.photo.deleteMany({ where: { albumId } });
  await db.album.delete({ where: { id: albumId } });

  return new Response(null, { status: 204 });
}
