import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtRule(r: any) {
  return {
    id: r.id,
    schoolId: r.schoolId,
    label: r.label,
    type: r.type,
    value: r.value,
    scope: r.scope,
    scopeId: r.scopeId ?? null,
    minOrderAmount: r.minOrderAmount ?? null,
    enabled: r.enabled,
    startsAt: r.startsAt?.toISOString() ?? null,
    endsAt: r.endsAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ruleId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { ruleId } = await params;
  const body = await req.json();

  const data: Record<string, any> = {};
  const fields = ["label", "type", "value", "scope", "scopeId", "minOrderAmount", "enabled"] as const;
  for (const field of fields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (body.startsAt !== undefined) data.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  if (body.endsAt !== undefined) data.endsAt = body.endsAt ? new Date(body.endsAt) : null;

  const rule = await db.pricingRule.update({ where: { id: ruleId }, data });

  return ok(fmtRule(rule));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ ruleId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { ruleId } = await params;

  await db.pricingRule.delete({ where: { id: ruleId } });

  return new Response(null, { status: 204 });
}
