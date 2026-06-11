import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  if (auth.role === "platform_admin" && auth.id === "platform-admin") {
    return ok({
      user: {
        id: "platform-admin",
        name: "Platform Admin",
        email: "platform-admin@snapschool.app",
        role: "platform_admin",
        avatarUrl: null,
        schoolIds: [],
      },
      token: req.headers.get("authorization")?.slice(7) ?? "",
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });
  }

  const user = await db.user.findUnique({ where: { id: auth.id } });
  if (!user) return err("User not found.", 404);

  const admins = await db.schoolAdmin.findMany({ where: { userId: user.id } });
  const schoolIds = admins.map((a) => a.schoolId);

  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, schoolIds },
    token: req.headers.get("authorization")?.slice(7) ?? "",
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  });
}
