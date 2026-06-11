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

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !subject || !message) {
    return err("Name, email, subject, and message are required.", 400);
  }

  const ticket = await db.supportTicket.create({
    data: { name, email, subject, message },
  });

  return ok(fmtTicket(ticket), 201);
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const tickets = await db.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
  return ok(tickets.map(fmtTicket));
}
