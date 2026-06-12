import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { sendCampaignEmail } from "@/lib/resend-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtCampaign(c: any) {
  return {
    id: c.id,
    subject: c.subject,
    body: c.body,
    recipientCount: c.recipientCount,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const campaigns = await db.marketingCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return ok(campaigns.map(fmtCampaign));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "platform_admin") return err("Unauthorized.", 403);

  const { subject, body } = await req.json();
  if (!subject || !body) return err("Subject and body are required.", 400);

  const recipients = await db.user.findMany({
    where: { role: "parent", marketingOptOut: false },
    select: { email: true },
  });
  const recipientEmails = recipients.map((r) => r.email);

  const emailsSent = await sendCampaignEmail(recipientEmails, subject, body);

  const campaign = await db.marketingCampaign.create({
    data: { subject, body, recipientCount: recipientEmails.length },
  });

  return ok({ ...fmtCampaign(campaign), emailsSent }, 201);
}
