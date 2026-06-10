import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";

// Hardcoded platform-admin credentials — separate from the school-admin (email-only) login.
const PLATFORM_ADMIN_USERNAME = "platformadmin";
const PLATFORM_ADMIN_PASSWORD = "Snap@Admin2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid request body.", 400);

    const { username, password } = body;
    if (!username || !password) return err("Username and password are required.", 400);

    if (username !== PLATFORM_ADMIN_USERNAME || password !== PLATFORM_ADMIN_PASSWORD) {
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
