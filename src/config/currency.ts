import type { CountryOption, CurrencyOption } from "@/types";

/**
 * Static seed data for currencies/countries. In production, `rateToBase` should be replaced
 * by a live exchange-rate feed (see `env.exchangeRateApiUrl`) — keep consumers reading through
 * `getCurrency()` / `convertAmount()` so swapping the data source later requires no UI changes.
 */
export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rateToBase: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rateToBase: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rateToBase: 0.79 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateToBase: 83.1 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateToBase: 1.52 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateToBase: 1.36 },
];

export const COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", currencyCode: "USD" },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP" },
  { code: "DE", name: "Germany", currencyCode: "EUR" },
  { code: "FR", name: "France", currencyCode: "EUR" },
  { code: "IN", name: "India", currencyCode: "INR" },
  { code: "AU", name: "Australia", currencyCode: "AUD" },
  { code: "CA", name: "Canada", currencyCode: "CAD" },
];

export function getCurrency(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function getCountry(code: string): CountryOption | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/** Converts an amount from one currency to another via the shared base-currency rates. */
export function convertAmount(amount: number, fromCode: string, toCode: string): number {
  if (fromCode === toCode) return amount;
  const from = getCurrency(fromCode);
  const to = getCurrency(toCode);
  return (amount / from.rateToBase) * to.rateToBase;
}

export function formatCurrency(amount: number, currencyCode: string, locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const { symbol } = getCurrency(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  }
}
