import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

function fmtStudent(s: any) {
  return {
    id: s.id,
    schoolId: s.schoolId,
    classId: s.classId ?? null,
    number: s.number ?? null,
    name: s.name,
    username: s.username,
    accessCode: s.accessCode,
    coverPhotoUrl: s.coverPhotoUrl ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { studentId } = await params;

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return err("Student not found.", 404);

  return ok(fmtStudent(student));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { studentId } = await params;
  const body = await req.json();
  const { name, number, coverPhotoUrl, classId } = body;

  const data: Record<string, any> = {};
  if (name !== undefined) data.name = name;
  if (number !== undefined) data.number = number;
  if (coverPhotoUrl !== undefined) data.coverPhotoUrl = coverPhotoUrl;
  if (classId !== undefined) data.classId = classId;

  const student = await db.student.update({ where: { id: studentId }, data });

  return ok(fmtStudent(student));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { studentId } = await params;

  await db.student.delete({ where: { id: studentId } });

  return new Response(null, { status: 204 });
}
