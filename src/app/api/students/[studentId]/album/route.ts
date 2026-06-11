import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-helpers";

function fmtStudent(s: any) {
  return {
    id: s.id,
    schoolId: s.schoolId,
    classId: s.classId ?? null,
    number: s.number ?? null,
    name: s.name,
    username: s.username,
    accessCode: s.accessCode,
    coverPhotoUrl: s.coverPhotoUrl ?? null,
    createdAt: s.createdAt.toISOString(),
  };
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
    pricing: { priceListId: a.priceListId ?? a.class?.priceListId ?? null, currencyCode: "" },
    photoCount: a.photoCount,
    flaggedCount: a.flaggedCount,
    eventDate: a.eventDate?.toISOString() ?? undefined,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

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

function fmtItem(item: any) {
  return {
    id: item.id,
    priceListId: item.priceListId,
    type: item.type,
    name: item.name,
    amount: item.amount,
    description: item.description ?? null,
    previewImageUrl: item.previewImageUrl ?? null,
    unitsIncluded: item.unitsIncluded ?? null,
    category: item.category ?? null,
  };
}

function fmtPriceList(pl: any) {
  return {
    id: pl.id,
    schoolId: pl.schoolId,
    name: pl.name,
    countryCode: pl.countryCode,
    currencyCode: pl.currencyCode,
    isDefault: pl.isDefault,
    items: (pl.items ?? []).map(fmtItem),
    updatedAt: pl.updatedAt.toISOString(),
  };
}

/** Public endpoint for the parent QR landing page: a student's album, photos, and resolved price list. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return err("Student not found.", 404);

  const album = await db.album.findFirst({ where: { studentId }, include: { class: true } });

  let photos: any[] = [];
  let priceList: any = null;

  if (album) {
    photos = await db.photo.findMany({
      where: { albumId: album.id, faceValidationStatus: { not: "flagged" } },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "asc" },
    });

    const effectivePriceListId = album.priceListId ?? album.class?.priceListId ?? null;
    if (effectivePriceListId) {
      priceList = await db.priceList.findUnique({
        where: { id: effectivePriceListId },
        include: { items: true },
      });
    }
    if (!priceList) {
      priceList =
        (await db.priceList.findFirst({
          where: { schoolId: album.schoolId, isDefault: true },
          include: { items: true },
        })) ??
        (await db.priceList.findFirst({
          where: { schoolId: album.schoolId },
          include: { items: true },
        }));
    }
  }

  return ok({
    student: fmtStudent(student),
    album: album ? fmtAlbum(album) : null,
    photos: photos.map(fmtPhoto),
    priceList: priceList ? fmtPriceList(priceList) : null,
  });
}
