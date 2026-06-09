import type { ID, ISODateString } from "./common";

/** Platform-level admin manages every tenant; school-admin is scoped to their own school(s). */
export type UserRole = "platform_admin" | "school_admin";

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
