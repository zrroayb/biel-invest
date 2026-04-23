"use client";

import { useLocale } from "next-intl";
import type { Property, LocaleKey } from "@/types/property";
import { convertToDisplayCurrency } from "@/lib/money/convert-display";
import { formatPrice, cn } from "@/lib/utils";
import { usePriceCurrency } from "./price-currency-provider";

export function DisplayPrice({
  amount,
  currency,
  className,
}: {
  amount: number;
  currency: Property["currency"];
  className?: string;
}) {
  const locale = useLocale() as LocaleKey;
  const { displayCurrency, rates } = usePriceCurrency();
  const converted = convertToDisplayCurrency(amount, currency, displayCurrency, rates);

  return (
    <span className={cn("tabular-nums", className)}>
      {formatPrice(converted, displayCurrency, locale)}
    </span>
  );
}
