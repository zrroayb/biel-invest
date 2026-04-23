import type { Metadata } from "next";
import { getPublicOriginForMetadata } from "@/lib/seo/request-origin";
import {
  absoluteUrlFromOrigin,
  languageAlternatesFromOrigin,
  openGraphLocale,
  siteBaseUrl,
  toAbsoluteImageUrl,
} from "@/lib/seo/urls";

const SITE_NAME = "BIEL Invest";

function defaultOgImage(): { url: string }[] | undefined {
  const custom = process.env.NEXT_PUBLIC_OG_IMAGE_DEFAULT?.trim();
  if (custom) return [{ url: custom }];
  const base = siteBaseUrl();
  return [{ url: `${base}/brand/biel-invest.svg` }];
}

export async function buildPublicPageMetadata({
  locale,
  pathSegment,
  title,
  description,
}: {
  locale: string;
  pathSegment: string;
  title: string;
  description: string;
}): Promise<Metadata> {
  const origin = await getPublicOriginForMetadata();
  const canonical = absoluteUrlFromOrigin(origin, locale, pathSegment);
  const languages = languageAlternatesFromOrigin(origin, pathSegment);
  languages[locale] = canonical;
  const ogImage = defaultOgImage();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: openGraphLocale[locale] ?? locale,
      alternateLocale: Object.entries(openGraphLocale)
        .filter(([l]) => l !== locale)
        .map(([, v]) => v),
      type: "website",
      ...(ogImage ? { images: ogImage } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: ogImage.map((i) => i.url) } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export async function buildPropertyMetadata({
  locale,
  slug,
  title,
  description,
  coverUrl,
}: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
}): Promise<Metadata> {
  const pathSegment = `/portfoy/${slug}`;
  const origin = await getPublicOriginForMetadata();
  const canonical = absoluteUrlFromOrigin(origin, locale, pathSegment);
  const languages = languageAlternatesFromOrigin(origin, pathSegment);
  languages[locale] = canonical;
  const absImage = toAbsoluteImageUrl(coverUrl);
  const fallbackImages = defaultOgImage();
  const images = absImage
    ? [{ url: absImage }]
    : fallbackImages
      ? fallbackImages
      : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: openGraphLocale[locale] ?? locale,
      alternateLocale: Object.entries(openGraphLocale)
        .filter(([l]) => l !== locale)
        .map(([, v]) => v),
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}
