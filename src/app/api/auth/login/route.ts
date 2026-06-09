import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid request body.", 400);

    const { email, password } = body;
    if (!email || !password) return err("Email and password are required.", 400);

    const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user || !bcrypt.compareSync(String(password), user.password)) {
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
