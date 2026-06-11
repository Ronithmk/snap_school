"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import type { ForgotPasswordInput, LoginCredentials, PlatformLoginCredentials, RegisterInput, ResetPasswordInput } from "@/types";

const SESSION_QUERY_KEY = ["session"] as const;

/** Single source of truth for "who is logged in". Restores the session on reload via the stored token. */
export function useSession() {
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const query = useQuery({
    queryKey: [...SESSION_QUERY_KEY, session?.token],
    queryFn: async () => {
      if (!session?.token) return null;
      const fresh = await authService.getSession(session.token);
      if (!fresh) setSession(null);
      return fresh;
    },
    initialData: session ?? undefined,
    staleTime: Infinity,
    enabled: hasHydrated && !!session?.token,
  });

  return {
    session: query.data ?? null,
    user: query.data?.user ?? null,
    isAuthenticated: !!query.data,
    // Until the persisted session is restored from localStorage, treat auth as "loading"
    // so route guards don't redirect to login on a hard page reload (e.g. window.location).
    isLoading: !hasHydrated || query.isLoading,
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

export function usePlatformLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: PlatformLoginCredentials) => authService.platformLogin(credentials),
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

/** Registration only creates the account — the user signs in separately afterwards. */
export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });
}
