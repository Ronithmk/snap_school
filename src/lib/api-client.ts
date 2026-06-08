import axios, { type AxiosError, type AxiosInstance } from "axios";
import { env } from "@/config/env";
import type { ApiError } from "@/types";

/**
 * Single shared axios instance. All real (non-mock) requests should go through here so
 * base URL, auth headers, and error shape stay consistent app-wide.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("snapschool.auth.token");
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; fieldErrors?: Record<string, string[]> }>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message ?? "Unexpected error",
      code: error.response?.data?.code,
      fieldErrors: error.response?.data?.fieldErrors,
    };
    return Promise.reject(apiError);
  },
);
