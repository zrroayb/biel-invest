import { defineRouting } from "next-intl/routing";

/**
 * Intentionally **no** `createNavigation` here — that pulls in
 * `next-intl` server getConfig, which in turn loads `i18n/request` and
 * would drag Firebase (Admin SDK) into the Edge **middleware** bundle.
 * Import navigation helpers from `@/i18n/navigation` instead.
 */
export const routing = defineRouting({
  locales: ["tr", "en", "de", "ru"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  // Sadece URL’deki dil öneki (veya varsayılan TR); tarayıcı dili / çerez ile DE’ye zorlamayı kapatır.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
