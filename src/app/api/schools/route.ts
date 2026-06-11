import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, paginate, parseIntParam } from "@/lib/api-helpers";
import { formatDbSchool } from "@/lib/format-school";
import { CACHE_TAGS, getCachedSchools } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);

  let formatted = await getCachedSchools();

  if (auth.role !== "platform_admin" && auth.schoolIds?.length) {
    formatted = formatted.filter((s) => auth.schoolIds!.includes(s.id));
  }
  if (search) {
    const q = search.toLowerCase();
    formatted = formatted.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }

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

  revalidateTag(CACHE_TAGS.schools, { expire: 0 });

  return ok(formatDbSchool(school), 201);
}
