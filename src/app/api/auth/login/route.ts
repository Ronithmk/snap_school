import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return err("Email and password are required.", 400);

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
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
}
