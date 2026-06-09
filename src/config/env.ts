/**
 * Centralized, typed access to environment variables.
 * Never read `process.env.*` directly elsewhere — extend this file instead.
 */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  /** Mock layer is OFF by default. Set NEXT_PUBLIC_USE_MOCK_API="true" to enable. */
  useMockApi: (process.env.NEXT_PUBLIC_USE_MOCK_API ?? "false") === "true",
  /** Base currency that all stored rates are relative to. */
  baseCurrency: process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "USD",
  exchangeRateApiUrl: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL ?? "",
} as const;
