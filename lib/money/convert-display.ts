import type { Property } from "@/types/property";
import type { DisplayCurrency, FxRates } from "./fx-shared";

type StoredCurrency = Property["currency"];

/**
 * Convert listing amount from its stored currency to a visitor display currency.
 * `rates.*` = units per 1 EUR (e.g. USD = 1.08 → 1 EUR = 1.08 USD).
 */
export function convertToDisplayCurrency(
  amount: number,
  from: StoredCurrency,
  to: DisplayCurrency,
  rates: FxRates,
): number {
  if (from === to) return amount;

  const inEur =
    from === "EUR"
      ? amount
      : amount / (rates[from as keyof FxRates] as number);

  if (to === "EUR") return inEur;
  return inEur * (rates[to as keyof FxRates] as number);
}
