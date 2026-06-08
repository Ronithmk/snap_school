"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginCredentials } from "@/types";

const SESSION_QUERY_KEY = ["session"] as const;

/** Single source of truth for "who is logged in". Restores the session on reload via the stored token. */
export function useSession() {
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);

  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      if (!session?.token) return null;
      const fresh = await authService.getSession(session.token);
      if (!fresh) setSession(null);
      return fresh;
    },
    initialData: session,
    staleTime: Infinity,
    enabled: !!session?.token,
  });

  return {
    session: query.data ?? null,
    user: query.data?.user ?? null,
    isAuthenticated: !!query.data,
    isLoading: query.isLoading,
  };
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: ({ session }) => {
      setSession(session);
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return () => {
    clearSession();
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
  };
}
