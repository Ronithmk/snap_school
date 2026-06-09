import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return err("Name, email, and password are required.", 400);

  const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return err("An account with this email already exists.", 409, "email_taken");

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      role: "school_admin",
    },
  });

  const token = await signToken({ id: user.id, role: user.role, schoolIds: [] });

  return ok({
    session: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, schoolIds: [] },
      token,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    },
  });
}
