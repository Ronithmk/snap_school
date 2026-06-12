import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { ok, err } from "@/lib/api-helpers";

function generateUsername(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { studentId } = await params;

  const existing = await db.student.findUnique({ where: { id: studentId } });
  if (!existing) return err("Student not found.", 404);
  if (!canManageSchool(user, existing.schoolId)) return err("Unauthorized.", 403);

  const student = await db.student.update({
    where: { id: studentId },
    data: {
      username: generateUsername(),
      accessCode: generateAccessCode(),
    },
  });

  return ok(fmtStudent(student));
}
