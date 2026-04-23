"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics/track-public-event";

/**
 * Records public site route changes (not admin).
 */
export function PublicActivityTracker() {
  const pathname = usePathname();
  const locale = useLocale();
  const lastRef = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    const prev = lastRef.current;
    if (prev && prev.path === pathname && now - prev.at < 1200) return;
    lastRef.current = { path: pathname, at: now };
    void trackPageView(pathname, locale);
  }, [pathname, locale]);

  return null;
}
