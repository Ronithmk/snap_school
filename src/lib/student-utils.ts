// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fmtStudent(s: any) {
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

export function generateUsername(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

export function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
