import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { Regions } from "@/components/home/regions";
import { AboutSnippet } from "@/components/home/about-snippet";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { regionTileImage } from "@/lib/property-taxonomy/region-fallback-images";
import {
  listAreas,
  areaForRegion,
  areaLabel,
} from "@/lib/property-taxonomy/region-areas";
import { listProperties } from "@/lib/firestore/properties";
import { buildPublicPageMetadata } from "@/lib/seo/page-meta";
import { logError, logInfo } from "@/lib/log/server";
import type { Property } from "@/types/property";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPublicPageMetadata({
    locale,
    pathSegment: "",
    title: t("homeTitle"),
    description: t("homeDescription"),
  });
}

async function safeList(): Promise<Property[]> {
  try {
    return await listProperties({ featured: true, limit: 6 });
  } catch (err) {
    logError("home", "featured_list_failed", {}, err);
    return [];
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  logInfo("home", "render_start", { locale });

  const featured = await safeList();

  // Bölgeleri alanlara (Bodrum / İstanbul / Kuzey Kıbrıs) göre gruplayıp
  // her alan için temsili kapak görseli ve ilan sayısı ile kare üret.
  let all: Property[] = [];
  try {
    all = await listProperties({ limit: 1000 });
  } catch {
    all = [];
  }
  const PROP_WORD: Record<string, string> = {
    tr: "mülk",
    en: "properties",
    de: "Immobilien",
    ru: "объектов",
  };
  const word = PROP_WORD[locale] ?? PROP_WORD.tr;
  const areaTiles = listAreas()
    .map((area) => {
      const inArea = all.filter((p) => areaForRegion(p.region) === area.id);
      if (inArea.length === 0) return null;
      const cover =
        inArea.find((p) => p.featured && p.media.cover)?.media.cover ??
        inArea.find((p) => p.media.cover)?.media.cover ??
        regionTileImage({ id: area.id, labels: {} });
      return {
        id: area.id,
        imageUrl: cover,
        title: areaLabel(area, locale),
        subtitle: `${inArea.length} ${word}`,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  logInfo("home", "render_data", {
    locale,
    featuredCount: featured.length,
    areaTiles: areaTiles.length,
  });

  return (
    <>
      <HomeJsonLd />
      <Hero />
      <FeaturedProperties items={featured} />
      <AboutSnippet />
      <Regions tiles={areaTiles} />
    </>
  );
}
