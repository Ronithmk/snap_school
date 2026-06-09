import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
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

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const classId = searchParams.get("classId");

  if (!schoolId) return err("schoolId query param is required.", 400);

  const where: Record<string, any> = { schoolId };
  if (classId) where.classId = classId;

  const students = await db.student.findMany({
    where,
    orderBy: [{ classId: "asc" }, { number: "asc" }],
  });

  return ok(students.map(fmtStudent));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const body = await req.json();
  const { schoolId, classId, name, number, coverPhotoUrl } = body;

  if (!schoolId || !name) return err("schoolId and name are required.", 400);

  const username = generateUsername();
  const accessCode = generateAccessCode();

  const student = await db.student.create({
    data: {
      schoolId,
      classId: classId ?? null,
      name,
      number: number ?? null,
      username,
      accessCode,
      coverPhotoUrl: coverPhotoUrl ?? null,
    },
  });

  return ok(fmtStudent(student), 201);
}
