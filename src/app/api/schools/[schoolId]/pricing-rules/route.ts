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

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;

  const rules = await db.pricingRule.findMany({
    where: { schoolId },
    orderBy: { createdAt: "asc" },
  });

  return ok(rules.map(fmtRule));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { schoolId } = await params;
  const body = await req.json();
  const { label, type, value, scope, scopeId, minOrderAmount, enabled, startsAt, endsAt } = body;

  if (!label || !type || value === undefined || !scope) {
    return err("label, type, value, and scope are required.", 400);
  }

  const rule = await db.pricingRule.create({
    data: {
      schoolId,
      label,
      type,
      value,
      scope,
      scopeId: scopeId ?? null,
      minOrderAmount: minOrderAmount ?? null,
      enabled: enabled ?? true,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });

  return ok(fmtRule(rule), 201);
}
