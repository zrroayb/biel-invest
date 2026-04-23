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
  initialRates,
}: {
  children: React.ReactNode;
  initialRates: FxRates;
}) {
  const [displayCurrency, setDisplayCurrencyState] =
    useState<DisplayCurrency>("EUR");

  useEffect(() => {
    const stored = readStoredCurrency();
    if (stored) setDisplayCurrencyState(stored);
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const rates = initialRates;

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
