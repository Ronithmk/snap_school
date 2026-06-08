/**
 * Centralized, typed access to environment variables.
 * Never read `process.env.*` directly elsewhere — extend this file instead.
 */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  /** Toggles the mock service layer. Flip to "false" once a real backend is wired up. */
  useMockApi: (process.env.NEXT_PUBLIC_USE_MOCK_API ?? "true") !== "false",
  /** Base currency that all stored rates are relative to. */
  baseCurrency: process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "USD",
  exchangeRateApiUrl: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL ?? "",
} as const;
