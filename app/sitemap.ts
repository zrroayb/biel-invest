import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listProperties } from "@/lib/firestore/properties";

const STATIC_PATHS = ["", "/portfoy", "/hakkimizda", "/iletisim"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      entries.push({
        url: `${base}${prefix}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${base}${l === routing.defaultLocale ? "" : `/${l}`}${path}`,
            ]),
          ),
        },
      });
    }
  }

  try {
    const properties = await listProperties({ limit: 500 });
    for (const p of properties) {
      for (const locale of routing.locales) {
        const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
        entries.push({
          url: `${base}${prefix}/portfoy/${p.slug}`,
          changeFrequency: "weekly",
          priority: 0.8,
          lastModified: p.updatedAt,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((l) => [
                l,
                `${base}${l === routing.defaultLocale ? "" : `/${l}`}/portfoy/${p.slug}`,
              ]),
            ),
          },
        });
      }
    }
  } catch {
    // DB not configured yet
  }

  return entries;
}
