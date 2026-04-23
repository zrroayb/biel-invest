"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DISPLAY_CURRENCIES,
  FX_FALLBACK_RATES,
  type DisplayCurrency,
  type FxRates,
} from "@/lib/money/fx-shared";

const STORAGE_KEY = "bodrum-estate:display-currency";

function readStoredCurrency(): DisplayCurrency | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && DISPLAY_CURRENCIES.includes(raw as DisplayCurrency))
      return raw as DisplayCurrency;
  } catch {
    /* ignore */
  }
  return null;
}

type PriceCurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  rates: FxRates;
};

const PriceCurrencyContext = createContext<PriceCurrencyContextValue | null>(
  null,
);

export function PriceCurrencyProvider({
  children,
  initialRates = FX_FALLBACK_RATES,
}: {
  children: React.ReactNode;
  /** SSR / first paint; live ECB rates load from /api/fx after mount. */
  initialRates?: FxRates;
}) {
  const [displayCurrency, setDisplayCurrencyState] =
    useState<DisplayCurrency>("EUR");
  const [rates, setRates] = useState<FxRates>(initialRates);

  useEffect(() => {
    const stored = readStoredCurrency();
    if (stored) setDisplayCurrencyState(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fx")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Partial<FxRates> | null) => {
        if (
          cancelled ||
          !data ||
          typeof data.USD !== "number" ||
          typeof data.TRY !== "number"
        ) {
          return;
        }
        setRates({
          EUR: 1,
          USD: data.USD,
          TRY: data.TRY,
          GBP: typeof data.GBP === "number" ? data.GBP : initialRates.GBP,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialRates.GBP]);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ displayCurrency, setDisplayCurrency, rates }),
    [displayCurrency, setDisplayCurrency, rates],
  );

  return (
    <PriceCurrencyContext.Provider value={value}>
      {children}
    </PriceCurrencyContext.Provider>
  );
}

export function usePriceCurrency(): PriceCurrencyContextValue {
  const ctx = useContext(PriceCurrencyContext);
  if (!ctx) {
    return {
      displayCurrency: "EUR",
      setDisplayCurrency: () => {},
      rates: FX_FALLBACK_RATES,
    };
  }
  return ctx;
}
