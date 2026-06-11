import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-helpers";
import { getCachedSchoolBySlug } from "@/lib/cache";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const school = await getCachedSchoolBySlug(slug);
  if (!school) return err("School not found.", 404);

  return ok(school);
}
