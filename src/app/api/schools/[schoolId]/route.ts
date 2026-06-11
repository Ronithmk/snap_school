import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { formatDbSchool } from "@/lib/format-school";

async function fmtSchool(school: Parameters<typeof formatDbSchool>[0]) {
  const [classCount, albumCount] = await Promise.all([
    db.schoolClass.count({ where: { schoolId: school.id } }),
    db.album.count({ where: { schoolId: school.id } }),
  ]);
  return formatDbSchool(school, { classCount, albumCount });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  const school = await db.school.findUnique({ where: { id: schoolId } });
  if (!school) return err("School not found.", 404);

  return ok(await fmtSchool(school));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  const body = await req.json();
  const { name, slug, logoUrl, bannerUrl, description, settings, status } = body;

  const data: Record<string, any> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (logoUrl !== undefined) data.logoUrl = logoUrl;
  if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;
  if (description !== undefined) data.description = description;
  if (settings !== undefined) data.settings = typeof settings === "string" ? settings : JSON.stringify(settings);
  if (status !== undefined) data.status = status;

  const school = await db.school.update({ where: { id: schoolId }, data });

  return ok(await fmtSchool(school));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  await db.school.delete({ where: { id: schoolId } });

  return new Response(null, { status: 204 });
}
