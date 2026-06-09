import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtBlock(b: any) {
  return {
    id: b.id,
    schoolId: b.schoolId,
    type: b.type,
    title: b.title ?? null,
    subtitle: b.subtitle ?? null,
    body: b.body ?? null,
    imageUrl: b.imageUrl ?? null,
    ctaLabel: b.ctaLabel ?? null,
    ctaUrl: b.ctaUrl ?? null,
    announcementStyle: b.announcementStyle ?? null,
    priority: b.priority,
    enabled: b.enabled,
    startsAt: b.startsAt?.toISOString() ?? null,
    endsAt: b.endsAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ blockId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { blockId } = await params;
  const body = await req.json();

  const data: Record<string, any> = {};
  const fields = [
    "type", "title", "subtitle", "imageUrl", "ctaLabel", "ctaUrl",
    "announcementStyle", "priority", "enabled",
  ] as const;
  for (const field of fields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (body.body !== undefined) data.body = body.body;
  if (body.startsAt !== undefined) data.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  if (body.endsAt !== undefined) data.endsAt = body.endsAt ? new Date(body.endsAt) : null;

  const block = await db.contentBlock.update({ where: { id: blockId }, data });

  return ok(fmtBlock(block));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ blockId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { blockId } = await params;

  await db.contentBlock.delete({ where: { id: blockId } });

  return new Response(null, { status: 204 });
}
