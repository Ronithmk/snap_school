import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, username, accessCode } = await req.json();
    if (!name || !email || !password || !username || !accessCode) {
      return err("Name, email, password, and your child's username and access code are required.", 400);
    }

    const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return err("An account with this email already exists.", 409, "email_taken");

    const student = await db.student.findUnique({ where: { username: String(username) } });
    if (!student || student.accessCode !== String(accessCode)) {
      return err("We couldn't find a student with that username and access code.", 404, "student_not_found");
    }

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: bcrypt.hashSync(password, 10),
        role: "parent",
      },
    });

    await db.parentStudent.create({ data: { userId: user.id, studentId: student.id } });

    const token = await signToken({ id: user.id, role: user.role, schoolIds: [] });

    return ok({
      session: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, schoolIds: [] },
        token,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      },
    }, 201);
  } catch (e) {
    console.error("[parent-register]", e);
    return err("Something went wrong. Please try again.", 500);
  }
}
