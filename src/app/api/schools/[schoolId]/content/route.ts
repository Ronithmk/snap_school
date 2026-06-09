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

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  const blocks = await db.contentBlock.findMany({
    where: { schoolId },
    orderBy: { priority: "asc" },
  });

  return ok(blocks.map(fmtBlock));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;
  const body = await req.json();
  const {
    type,
    title,
    subtitle,
    bodyText,
    body: bodyField,
    imageUrl,
    ctaLabel,
    ctaUrl,
    announcementStyle,
    priority,
    enabled,
    startsAt,
    endsAt,
  } = body;

  if (!type) return err("type is required.", 400);

  const block = await db.contentBlock.create({
    data: {
      schoolId,
      type,
      title: title ?? null,
      subtitle: subtitle ?? null,
      body: bodyField ?? bodyText ?? null,
      imageUrl: imageUrl ?? null,
      ctaLabel: ctaLabel ?? null,
      ctaUrl: ctaUrl ?? null,
      announcementStyle: announcementStyle ?? null,
      priority: priority ?? 0,
      enabled: enabled ?? true,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });

  return ok(fmtBlock(block), 201);
}
