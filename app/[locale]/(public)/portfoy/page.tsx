import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPublicPageMetadata } from "@/lib/seo/page-meta";
import { listProperties } from "@/lib/firestore/properties";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFilters } from "@/components/property/property-filters";
import { PriceCurrencySwitcher } from "@/components/property/price-currency-switcher";
import { Reveal } from "@/components/motion/reveal";
import {
  getMergedPropertyTaxonomy,
  getRegionAndFeatureIdLists,
} from "@/lib/firestore/property-taxonomy";
import type { Property } from "@/types/property";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPublicPageMetadata({
    locale,
    pathSegment: "/portfoy",
    title: t("portfolioTitle"),
    description: t("portfolioDescription"),
  });
}

async function safeList(params: {
  type?: string;
  status?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  features?: string[];
  featured?: boolean;
  sort?: "newest" | "priceAsc" | "priceDesc";
}): Promise<Property[]> {
  try {
    return await listProperties({ ...params, limit: 120 });
  } catch {
    return [];
  }
}

export default async function PortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("portfolio");

  const tax = await getMergedPropertyTaxonomy();
  const { regionIds, featureIds } = getRegionAndFeatureIdLists(tax);

  const items = await safeList({
    type: typeof sp.type === "string" ? sp.type : undefined,
    status: typeof sp.status === "string" ? sp.status : undefined,
    region: typeof sp.region === "string" ? sp.region : undefined,
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
    bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
    features:
      typeof sp.features === "string"
        ? sp.features.split(",").filter(Boolean)
        : undefined,
    featured: sp.featured === "1",
    sort: (sp.sort as "newest" | "priceAsc" | "priceDesc") ?? "newest",
  });

  return (
    <div className="pt-[72px]">
      <section className="border-b border-ivory-300 bg-ivory">
        <div className="container py-16 md:py-24">
          {/* No Reveal here: above-the-fold title must be visible without scrolling / IO delay */}
          <div className="eyebrow">Bodrum · Ege</div>
          <h1 className="mt-3 font-display text-display-lg text-ink">
            {t("title")}
          </h1>
          <p className="mt-3 text-base text-ink-muted">{t("subtitle")}</p>
        </div>
      </section>

      <section className="container py-10">
        <div className="sticky top-[72px] z-20 -mx-5 mb-8 border-b border-ivory-300/90 bg-ivory/88 px-4 py-2.5 backdrop-blur-md md:mx-0 md:px-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <Suspense
                fallback={
                  <div className="flex animate-pulse gap-3 py-1" aria-hidden>
                    <div className="h-8 w-40 rounded-xs bg-ivory-200" />
                    <div className="h-8 max-w-xs flex-1 rounded-xs bg-ivory-200" />
                  </div>
                }
              >
                <PropertyFilters
                  resultCount={items.length}
                  regionIds={regionIds}
                  featureIds={featureIds}
                />
              </Suspense>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:pl-2">
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted md:inline">
                {t("displayCurrency")}
              </span>
              <PriceCurrencySwitcher />
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="font-display text-2xl text-ink">{t("empty")}</div>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.05}>
                <PropertyCard property={p} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
