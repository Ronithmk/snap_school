import type { getAuthUser } from "@/lib/auth-server";

type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;

/** Whether `user` may read/write resources belonging to `schoolId`. */
export function canManageSchool(user: AuthUser, schoolId: string): boolean {
  return user.role === "platform_admin" || (user.schoolIds ?? []).includes(schoolId);
}
