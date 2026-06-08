import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay, mockReject } from "@/services/mock/transport";
import { MOCK_USERS } from "@/services/mock/seed-data";
import type { LoginCredentials, LoginResult, Session } from "@/types";

const ENDPOINTS = {
  login: "/auth/login",
  session: "/auth/session",
} as const;

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
      if (!MOCK_USERS.some((u) => u.id === userId)) return mockDelay(null);
      return mockDelay(buildSession(userId));
    }
    const { data } = await apiClient.get<Session>(ENDPOINTS.session, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
