import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import type { UserRole } from "@/types";

const DEMO_ACCOUNTS: Record<string, { id: string; name: string; role: UserRole; schoolIds: string[] }> = {
  "admin@snapschool.app": {
    id: "demo-platform-admin",
    name: "Demo Admin",
    role: "platform_admin",
    schoolIds: [],
  },
  "school@snapschool.app": {
    id: "demo-school-admin",
    name: "Demo School",
    role: "school_admin",
    schoolIds: [],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid request body.", 400);

    const { email } = body;
    if (!email) return err("Email is required.", 400);

    const normalizedEmail = String(email).toLowerCase();

    // Demo account short-circuit — works without a database connection
    const demo = DEMO_ACCOUNTS[normalizedEmail];
    if (demo) {
      const token = await signToken({ id: demo.id, role: demo.role, schoolIds: demo.schoolIds });
      return ok({
        session: {
          user: { id: demo.id, name: demo.name, email: normalizedEmail, role: demo.role, avatarUrl: null, schoolIds: demo.schoolIds },
          token,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return err("Invalid email or password.", 401, "invalid_credentials");
    }

    const admins = await db.schoolAdmin.findMany({ where: { userId: user.id } });
    const schoolIds = admins.map((a) => a.schoolId);
    const token = await signToken({ id: user.id, role: user.role, schoolIds });

    return ok({
      session: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, schoolIds },
        token,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (e) {
    console.error("[login]", e);
    return err("Something went wrong. Please try again.", 500);
  }
}
