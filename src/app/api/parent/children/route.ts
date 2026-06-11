import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "parent") return err("Unauthorized.", 401);

  const links = await db.parentStudent.findMany({
    where: { userId: user.id },
    include: { student: { include: { school: true } } },
    orderBy: { createdAt: "asc" },
  });

  const children = await Promise.all(
    links.map(async (link) => {
      const student = link.student;
      const album = await db.album.findFirst({ where: { studentId: student.id } });
      return {
        studentId: student.id,
        studentName: student.name,
        studentUsername: student.username,
        schoolId: student.schoolId,
        schoolName: student.school.name,
        schoolSlug: student.school.slug,
        albumId: album?.id ?? null,
        coverPhotoUrl: student.coverPhotoUrl ?? album?.coverImageUrl ?? null,
      };
    }),
  );

  return ok(children);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "parent") return err("Unauthorized.", 401);

  const { username, accessCode } = await req.json();
  if (!username || !accessCode) return err("Username and access code are required.", 400);

  const student = await db.student.findUnique({ where: { username: String(username) } });
  if (!student || student.accessCode !== String(accessCode)) {
    return err("We couldn't find a student with that username and access code.", 404, "student_not_found");
  }

  const existing = await db.parentStudent.findUnique({
    where: { userId_studentId: { userId: user.id, studentId: student.id } },
  });
  if (existing) return err("This child is already linked to your account.", 409, "already_linked");

  await db.parentStudent.create({ data: { userId: user.id, studentId: student.id } });

  return ok({ success: true }, 201);
}
