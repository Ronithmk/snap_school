import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, mockReject } from "@/services/mock/transport";
import { MOCK_USERS } from "@/services/mock/seed-data";
import type { ForgotPasswordInput, LoginCredentials, LoginResult, RegisterInput, ResetPasswordInput, Session } from "@/types";

const ENDPOINTS = {
  login: "/auth/login",
  session: "/auth/session",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;

/** In-memory mock store for registered users and pending reset tokens. */
const mockRegisteredUsers: (typeof MOCK_USERS[number])[] = [];
const mockResetTokens: Record<string, string> = {}; // token → userId

function buildSession(userId: string): Session {
  const found = MOCK_USERS.find((u) => u.id === userId)!;
  const { password: _password, ...user } = found;
  return {
    user,
    token: `mock-token.${user.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    if (env.useMockApi) {
      const match = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password,
      );
      if (!match) return mockReject("Invalid email or password.", 401, "invalid_credentials");
      return mockDelay({ session: buildSession(match.id) });
    }
    const { data } = await apiClient.post<LoginResult>(ENDPOINTS.login, credentials);
    return data;
  },

  async getSession(token: string): Promise<Session | null> {
    if (env.useMockApi) {
      const userId = token.split(".")[1];
      const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
      if (!allUsers.some((u) => u.id === userId)) return mockDelay(null);
      return mockDelay(buildSession(userId));
    }
    const { data } = await apiClient.get<Session>(ENDPOINTS.session, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async register(input: RegisterInput): Promise<LoginResult> {
    if (env.useMockApi) {
      const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
      if (allUsers.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        return mockReject("An account with this email already exists.", 409, "email_taken");
      }
      const newUser = {
        id: `usr_${Date.now()}`,
        name: input.name,
        email: input.email,
        password: input.password,
        role: "school_admin" as const,
        avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(input.name)}`,
      };
      mockRegisteredUsers.push(newUser);
      return mockDelay({ session: buildSession(newUser.id) });
    }
    const { data } = await apiClient.post<LoginResult>(ENDPOINTS.register, input);
    return data;
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    if (env.useMockApi) {
      const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
      const user = allUsers.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
      if (user) {
        const token = `rst_${Date.now()}_${user.id}`;
        mockResetTokens[token] = user.id;
      }
      // Always resolve — don't expose whether email exists
      return mockDelay(undefined);
    }
    await apiClient.post(ENDPOINTS.forgotPassword, input);
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    if (env.useMockApi) {
      const userId = mockResetTokens[input.token];
      if (!userId) return mockReject("This link is invalid or has expired.", 400, "invalid_token");
      const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
      const user = allUsers.find((u) => u.id === userId);
      if (user) user.password = input.password;
      delete mockResetTokens[input.token];
      return mockDelay(undefined);
    }
    await apiClient.post(ENDPOINTS.resetPassword, input);
  },
};
