/** Units of foreign currency per 1 EUR (Frankfurter / ECB style). */
export type FxRates = {
  EUR: 1;
  USD: number;
  TRY: number;
  GBP: number;
};

export const FX_FALLBACK_RATES: FxRates = {
  EUR: 1,
  USD: 1.08,
  TRY: 38.5,
  GBP: 0.83,
};

export type DisplayCurrency = "EUR" | "USD" | "TRY";

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ["EUR", "USD", "TRY"];
