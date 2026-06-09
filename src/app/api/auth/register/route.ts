import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
  const { name, email, password, schoolName } = await req.json();
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

  let schoolIds: string[] = [];

  if (schoolName) {
    const slug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueSlug = `${slug}-${Date.now()}`;
    const school = await db.school.create({
      data: { name: schoolName, slug: uniqueSlug, settings: "{}" },
    });
    await db.schoolAdmin.create({ data: { userId: user.id, schoolId: school.id } });
    schoolIds = [school.id];
  }

  const token = await signToken({ id: user.id, role: user.role, schoolIds });

  return ok({
    session: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, schoolIds },
      token,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    },
  }, 201);
  } catch (e) {
    console.error("[register]", e);
    return err("Something went wrong. Please try again.", 500);
  }
}
