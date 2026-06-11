import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { fmtStudent, generateUsername, generateAccessCode } from "@/lib/student-utils";

/** Get-or-create the "kid" (Student) record for an album, treating each album as one student. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;

  const album = await db.album.findUnique({ where: { id: albumId } });
  if (!album) return err("Album not found.", 404);

  if (album.studentId) {
    const existing = await db.student.findUnique({ where: { id: album.studentId } });
    if (existing) return ok(fmtStudent(existing));
  }

  const student = await db.student.create({
    data: {
      schoolId: album.schoolId,
      classId: album.classId ?? null,
      name: album.title,
      number: null,
      username: generateUsername(),
      accessCode: generateAccessCode(),
      coverPhotoUrl: album.coverImageUrl || null,
    },
  });

  await db.album.update({ where: { id: albumId }, data: { studentId: student.id } });

  return ok(fmtStudent(student), 201);
}
