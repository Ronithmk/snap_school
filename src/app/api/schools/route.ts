import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, paginate, parseIntParam } from "@/lib/api-helpers";
import { formatDbSchool } from "@/lib/format-school";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  let schools = await db.school.findMany({ orderBy: { name: "asc" } });

  if (auth.role !== "platform_admin" && auth.schoolIds?.length) {
    schools = schools.filter((s) => auth.schoolIds!.includes(s.id));
  }
  if (search) {
    const q = search.toLowerCase();
    schools = schools.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }

  const classes = await db.schoolClass.groupBy({ by: ["schoolId"], _count: true });
  const albums = await db.album.groupBy({ by: ["schoolId"], _count: true });
  const classMap = Object.fromEntries(classes.map((c) => [c.schoolId, c._count]));
  const albumMap = Object.fromEntries(albums.map((a) => [a.schoolId, a._count]));

  const formatted = schools.map((s) =>
    formatDbSchool(s, { classCount: classMap[s.id] ?? 0, albumCount: albumMap[s.id] ?? 0 }),
  );

  return ok(paginate(formatted, page, pageSize));
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  const body = await req.json();
  const { name, slug, logoUrl, bannerUrl, description, settings } = body;
  if (!name || !slug) return err("Name and slug are required.");

  const exists = await db.school.findUnique({ where: { slug } });
  if (exists) return err("A school with this slug already exists.", 409, "slug_taken");

  const school = await db.school.create({
    data: { name, slug, logoUrl, bannerUrl, description, settings: JSON.stringify(settings ?? {}) },
  });

  if (auth.role === "school_admin") {
    await db.schoolAdmin.create({ data: { userId: auth.id, schoolId: school.id } });
  }

  return ok(formatDbSchool(school), 201);
}
