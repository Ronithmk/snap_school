"use client";

import { useMemo } from "react";
import { convertAmount, formatCurrency } from "@/config/currency";

/**
 * Display-only currency conversion for the "live currency conversion" checkout UI.
 * `rateToBase` is static seed data today — swap `convertAmount`'s data source for a live
 * feed later and every consumer of this hook updates automatically.
 */
export function useCurrencyDisplay(amount: number, fromCurrency: string, toCurrency?: string) {
  return useMemo(() => {
    const target = toCurrency ?? fromCurrency;
    const converted = convertAmount(amount, fromCurrency, target);
    return {
      amount: converted,
      formatted: formatCurrency(converted, target),
      isConverted: target !== fromCurrency,
    };
  }, [amount, fromCurrency, toCurrency]);
}
