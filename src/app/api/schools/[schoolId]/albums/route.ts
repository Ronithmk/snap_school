import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, parseIntParam, paginate } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const search = searchParams.get("search");
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  const where: Record<string, any> = { schoolId };
  if (classId) where.classId = classId;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const albums = await db.album.findMany({ where, orderBy: { createdAt: "desc" } });

  const formatted = albums.map(fmtAlbum);
  return ok(paginate(formatted, page, pageSize));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;
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
  } = body;

  if (!title || !slug) return err("title and slug are required.", 400);

  const school = await db.school.findUnique({ where: { id: schoolId } });
  if (!school) return err("School not found.", 404);

  let passwordHash: string | null = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const album = await db.album.create({
    data: {
      schoolId,
      classId: classId ?? null,
      studentId: studentId ?? null,
      title,
      slug,
      description: description ?? null,
      visibility: visibility ?? "private",
      passwordHash,
      priceListId: priceListId ?? null,
      eventDate: eventDate ? new Date(eventDate) : null,
      coverImageUrl: undefined,
      shareUrl: "",
      photoCount: 0,
      flaggedCount: 0,
    },
  });

  const updated = await db.album.update({
    where: { id: album.id },
    data: { shareUrl: `/${school.slug}/album/${album.id}` },
  });

  revalidateTag(CACHE_TAGS.schools, { expire: 0 });

  return ok(fmtAlbum(updated), 201);
}
