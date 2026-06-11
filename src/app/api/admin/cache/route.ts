import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { CACHE_NAMESPACES, CACHE_TAGS } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth || auth.role !== "platform_admin") return err("Unauthorized.", 401);

  return ok(CACHE_NAMESPACES);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth || auth.role !== "platform_admin") return err("Unauthorized.", 401);

  const body = await req.json().catch(() => ({}));
  const tag = typeof body?.tag === "string" ? body.tag : null;

  if (tag && !Object.values(CACHE_TAGS).includes(tag as (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS])) {
    return err("Unknown cache tag.", 400);
  }

  const tags = tag ? [tag] : Object.values(CACHE_TAGS);
  for (const t of tags) revalidateTag(t, { expire: 0 });

  return ok({ cleared: tags });
}
