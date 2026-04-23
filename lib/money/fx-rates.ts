import "server-only";

import { FX_FALLBACK_RATES, type FxRates } from "./fx-shared";

export type { FxRates } from "./fx-shared";

/**
 * ECB-based spot rates via Frankfurter (no API key). Cached 1h.
 */
export async function getFxRatesForDisplay(): Promise<FxRates> {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=EUR&to=USD,TRY,GBP",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error("fx fetch failed");
    const data = (await res.json()) as { rates?: Record<string, number> };
    const r = data.rates;
    if (
      !r ||
      typeof r.USD !== "number" ||
      typeof r.TRY !== "number" ||
      typeof r.GBP !== "number"
    ) {
      throw new Error("fx parse");
    }
    return { EUR: 1, USD: r.USD, TRY: r.TRY, GBP: r.GBP };
  } catch {
    return FX_FALLBACK_RATES;
  }
}
