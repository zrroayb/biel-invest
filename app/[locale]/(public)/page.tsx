import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { Regions } from "@/components/home/regions";
import { AboutSnippet } from "@/components/home/about-snippet";
import { listProperties } from "@/lib/firestore/properties";
import type { Property } from "@/types/property";

export const revalidate = 300;

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

  return (
    <>
      <Hero />
      <FeaturedProperties items={featured} />
      <AboutSnippet />
      <Regions />
    </>
  );
}
