import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["tr", "en", "de", "ru"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  // Sadece URL’deki dil öneki (veya varsayılan TR); tarayıcı dili / çerez ile DE’ye zorlamayı kapatır.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
