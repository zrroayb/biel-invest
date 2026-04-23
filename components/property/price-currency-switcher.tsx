"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DISPLAY_CURRENCIES, type DisplayCurrency } from "@/lib/money/fx-shared";
import { usePriceCurrency } from "./price-currency-provider";

const LABELS: Record<DisplayCurrency, string> = {
  EUR: "EUR",
  USD: "USD",
  TRY: "TL",
};

export function PriceCurrencySwitcher({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const t = useTranslations("property.priceCurrency");
  const { displayCurrency, setDisplayCurrency } = usePriceCurrency();

  return (
    <div
      role="group"
      aria-label={t("ariaLabel")}
      className={cn(
        "inline-flex rounded-xs border border-ivory-300 bg-ivory-50 p-0.5",
        size === "md" && "p-1",
        className,
      )}
    >
      {DISPLAY_CURRENCIES.map((code) => (
        <button
          key={code}
          type="button"
          className={cn(
            "rounded-xs font-semibold uppercase tracking-wide transition-colors",
            size === "sm" && "px-2 py-1 text-[10px]",
            size === "md" && "px-3 py-1.5 text-xs",
            displayCurrency === code
              ? "bg-ink text-ivory"
              : "text-ink-muted hover:text-ink",
          )}
          onClick={() => setDisplayCurrency(code)}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
