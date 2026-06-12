import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_TAGS } from "@/lib/cache";
import { ensureStagingAlbum } from "@/lib/staging-album";

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { classId } = await params;

  const cls = await db.schoolClass.findUnique({ where: { id: classId } });
  if (!cls) return err("Class not found.", 404);

  const staging = await ensureStagingAlbum(classId);
  if (!staging) return err("Couldn't set up photo intake.", 500);

  revalidateTag(CACHE_TAGS.schools, { expire: 0 });

  return ok({ id: staging.id });
}
