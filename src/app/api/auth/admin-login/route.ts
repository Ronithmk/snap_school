import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

// Platform-admin credentials — separate from the school-admin (email-only) login.
// Configured via env vars; PLATFORM_ADMIN_PASSWORD_HASH is a bcrypt hash, not a plaintext password.
const PLATFORM_ADMIN_USERNAME = process.env.PLATFORM_ADMIN_USERNAME;
const PLATFORM_ADMIN_PASSWORD_HASH = process.env.PLATFORM_ADMIN_PASSWORD_HASH;

export async function POST(req: NextRequest) {
  try {
    if (!PLATFORM_ADMIN_USERNAME || !PLATFORM_ADMIN_PASSWORD_HASH) {
      return err("Admin login is not configured.", 503);
    }

    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid request body.", 400);

    const { username, password } = body;
    if (!username || !password) return err("Username and password are required.", 400);

    if (username !== PLATFORM_ADMIN_USERNAME || !bcrypt.compareSync(String(password), PLATFORM_ADMIN_PASSWORD_HASH)) {
      return err("Invalid username or password.", 401, "invalid_credentials");
    }

    const token = await signToken({ id: "platform-admin", role: "platform_admin", schoolIds: [] });

    return ok({
      session: {
        user: {
          id: "platform-admin",
          name: "Platform Admin",
          email: "platform-admin@snapschool.app",
          role: "platform_admin",
          avatarUrl: null,
          schoolIds: [],
        },
        token,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (e) {
    console.error("[admin-login]", e);
    return err("Something went wrong. Please try again.", 500);
  }
}
