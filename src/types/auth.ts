import type { ID, ISODateString } from "./common";

/**
 * Platform-level admin (Super Admin / studio team) manages every tenant and all photo
 * operations; school-admin is a view-only role scoped to their own school(s); parent
 * is a guardian account scoped to their own children's albums and orders.
 */
export type UserRole = "platform_admin" | "school_admin" | "parent";

export interface AuthUser {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  /** Schools this user can manage. Empty/undefined for platform_admin (sees all). */
  schoolIds?: ID[];
}

export interface Session {
  user: AuthUser;
  token: string;
  expiresAt: ISODateString;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Separate credential shape for the platform-admin-only sign-in. */
export interface PlatformLoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  session: Session;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  schoolName: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
