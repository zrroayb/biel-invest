import { routing } from "@/i18n/routing";

export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

/**
 * Path segment as in sitemap: "" for home, "/portfoy", "/portfoy/slug", etc.
 */
export function localizedPath(locale: string, pathSegment: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${pathSegment}`;
}

export function absoluteUrl(locale: string, pathSegment: string): string {
  return `${siteBaseUrl()}${localizedPath(locale, pathSegment)}`;
}

/** Same as {@link absoluteUrl} but with an explicit origin (request-derived or env). */
export function absoluteUrlFromOrigin(
  origin: string,
  locale: string,
  pathSegment: string,
): string {
  const o = origin.replace(/\/$/, "");
  return `${o}${localizedPath(locale, pathSegment)}`;
}

export function languageAlternatesFromOrigin(
  origin: string,
  pathSegment: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of routing.locales) {
    map[l] = absoluteUrlFromOrigin(origin, l, pathSegment);
  }
  map["x-default"] = absoluteUrlFromOrigin(origin, routing.defaultLocale, pathSegment);
  return map;
}

/** hreflang map + x-default (default locale). */
export function languageAlternates(pathSegment: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of routing.locales) {
    map[l] = absoluteUrl(l, pathSegment);
  }
  map["x-default"] = absoluteUrl(routing.defaultLocale, pathSegment);
  return map;
}

export const openGraphLocale: Record<string, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
  ru: "ru_RU",
};

/** Ensure remote image URL is absolute for OG tags. */
export function toAbsoluteImageUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  const base = siteBaseUrl();
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
