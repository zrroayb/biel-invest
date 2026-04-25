import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { Regions } from "@/components/home/regions";
import { AboutSnippet } from "@/components/home/about-snippet";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { getMergedPropertyTaxonomy } from "@/lib/firestore/property-taxonomy";
import { regionTileImage } from "@/lib/property-taxonomy/region-fallback-images";
import { listProperties } from "@/lib/firestore/properties";
import { buildPublicPageMetadata } from "@/lib/seo/page-meta";
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
  } catch {
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

  const featured = await safeList();
  const tax = await getMergedPropertyTaxonomy();
  const regionTiles = tax.regions.map((r) => ({
    id: r.id,
    imageUrl: regionTileImage(r),
  }));

  return (
    <>
      <HomeJsonLd />
      <Hero />
      <FeaturedProperties items={featured} />
      <AboutSnippet />
      <Regions tiles={regionTiles} />
    </>
  );
}
