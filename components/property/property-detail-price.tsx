"use client";

import { useTranslations } from "next-intl";
import type { Property } from "@/types/property";
import { DisplayPrice } from "./display-price";
import { PriceCurrencySwitcher } from "./price-currency-switcher";

export function PropertyDetailPrice({
  amount,
  currency,
}: {
  amount: number;
  currency: Property["currency"];
}) {
  const t = useTranslations("property");

  return (
    <div className="text-right">
      <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">
        {t("price")}
      </div>
      <DisplayPrice
        amount={amount}
        currency={currency}
        className="font-display text-3xl text-ink"
      />
      <div className="mt-3 flex flex-col items-end gap-1">
        <PriceCurrencySwitcher size="md" />
        <p className="max-w-[220px] text-[10px] leading-snug text-ink-muted">
          {t("priceCurrency.hint")}
        </p>
      </div>
    </div>
  );
}
