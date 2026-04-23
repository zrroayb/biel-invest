"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * Syncs `<html lang>` with the active locale (root layout defaults to `tr`).
 */
export function LocaleHtmlAttributes() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
