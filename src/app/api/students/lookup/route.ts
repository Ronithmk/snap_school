import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-helpers";

/** Public: resolves a student's username + access code (scoped to a school) to a student id, for the storefront gallery gate. */
export async function POST(req: NextRequest) {
  const { username, accessCode, schoolSlug } = await req.json();
  if (!username || !accessCode || !schoolSlug) {
    return err("Username, access code, and school are required.", 400);
  }

  const student = await db.student.findUnique({
    where: { username: String(username) },
    include: { school: true },
  });

  if (!student || student.accessCode !== String(accessCode) || student.school.slug !== String(schoolSlug)) {
    return err("We couldn't find a student with that username and access code.", 404, "student_not_found");
  }

  return ok({ studentId: student.id });
}
