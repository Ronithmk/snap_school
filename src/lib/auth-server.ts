import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-in-production");
const EXPIRES_IN = "8h";

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<{ id: string; role: string; schoolIds?: string[] } | null> {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || typeof payload.id !== "string") return null;
  return {
    id: payload.id as string,
    role: payload.role as string,
    schoolIds: payload.schoolIds as string[] | undefined,
  };
}
