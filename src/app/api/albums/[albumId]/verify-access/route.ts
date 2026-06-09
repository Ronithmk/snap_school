import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ albumId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { albumId } = await params;

  const album = await db.album.findUnique({ where: { id: albumId } });
  if (!album) return err("Album not found.", 404);

  if (!album.passwordHash) {
    return ok({ granted: true });
  }

  const body = await req.json();
  const { password } = body;

  if (!password) return err("Incorrect password.", 401, "invalid_password");

  const match = await bcrypt.compare(password, album.passwordHash);
  if (!match) return err("Incorrect password.", 401, "invalid_password");

  return ok({ granted: true });
}
