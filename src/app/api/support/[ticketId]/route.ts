import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtTicket(t: any) {
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    subject: t.subject,
    message: t.message,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const { ticketId } = await params;
  const { status } = await req.json();
  if (!status) return err("status is required.", 400);

  const ticket = await db.supportTicket.update({ where: { id: ticketId }, data: { status } });
  return ok(fmtTicket(ticket));
}
