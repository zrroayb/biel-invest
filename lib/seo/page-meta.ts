import type { Metadata } from "next";
import {
  absoluteUrl,
  languageAlternates,
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

export function buildPublicPageMetadata({
  locale,
  pathSegment,
  title,
  description,
}: {
  locale: string;
  pathSegment: string;
  title: string;
  description: string;
}): Metadata {
  const canonical = absoluteUrl(locale, pathSegment);
  const ogImage = defaultOgImage();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(pathSegment),
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

export function buildPropertyMetadata({
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
}): Metadata {
  const pathSegment = `/portfoy/${slug}`;
  const canonical = absoluteUrl(locale, pathSegment);
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
      languages: languageAlternates(pathSegment),
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
