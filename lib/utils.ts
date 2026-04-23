import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALES: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  ru: "ru-RU",
};

export function formatPrice(
  amount: number,
  currency: string = "EUR",
  locale: string = "en",
) {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[locale] ?? "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(value: number, locale: string = "en") {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[locale] ?? "en-US").format(
      value,
    );
  } catch {
    return String(value);
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
