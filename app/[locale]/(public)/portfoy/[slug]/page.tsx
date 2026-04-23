import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyBySlug } from "@/lib/firestore/properties";
import { buildPropertyMetadata } from "@/lib/seo/page-meta";
import { absoluteUrl, toAbsoluteImageUrl } from "@/lib/seo/urls";
import type { LocaleKey } from "@/types/property";
import { PropertyGallery } from "@/components/property/property-gallery";
import { VirtualTourModal } from "@/components/property/virtual-tour-modal";
import { InquiryForm } from "@/components/property/inquiry-form";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { FavoriteButton } from "@/components/property/favorite-button";
import { PropertyDetailPrice } from "@/components/property/property-detail-price";
import { Reveal } from "@/components/motion/reveal";
import { ArrowLeft, Bath, BedDouble, Maximize, Ruler } from "lucide-react";
import { Link } from "@/i18n/routing";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const p = await getPropertyBySlug(slug);
    if (!p) return {};
    const tr =
      p.translations[locale as LocaleKey] ?? p.translations.tr;
    const desc =
      tr.description.trim().slice(0, 160) ||
      `${tr.title} — Bodrum, ${p.region}`;
    return buildPropertyMetadata({
      locale,
      slug,
      title: tr.title,
      description: desc,
      coverUrl: p.media.cover,
    });
  } catch {
    return {};
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("property");
  const tRegions = await getTranslations("regions");
  const tNav = await getTranslations("nav");

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const tr = property.translations[locale as LocaleKey] ?? property.translations.tr;
  const gallery = property.media.cover
    ? [property.media.cover, ...property.media.gallery.filter((g) => g !== property.media.cover)]
    : property.media.gallery;

  const specs = [
    property.specs.bedrooms != null && {
      icon: BedDouble,
      label: t("bedrooms"),
      value: property.specs.bedrooms,
    },
    property.specs.bathrooms != null && {
      icon: Bath,
      label: t("bathrooms"),
      value: property.specs.bathrooms,
    },
    property.specs.areaGross != null && {
      icon: Maximize,
      label: t("areaGross"),
      value: `${property.specs.areaGross} m²`,
    },
    property.specs.plotSize != null && {
      icon: Ruler,
      label: t("plotSize"),
      value: `${property.specs.plotSize} m²`,
    },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string | number }[];

  const listingUrl = absoluteUrl(locale, `/portfoy/${slug}`);
  const imageUrls = gallery
    .map((u) => toAbsoluteImageUrl(u))
    .filter((u): u is string => Boolean(u));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        name: tr.title,
        description: tr.description,
        url: listingUrl,
        image: imageUrls.length ? imageUrls : undefined,
        offers: {
          "@type": "Offer",
          url: listingUrl,
          price: property.price,
          priceCurrency: property.currency,
        },
        address: {
          "@type": "PostalAddress",
          addressRegion: tRegions(property.region),
          addressCountry: "TR",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: tNav("home"),
            item: absoluteUrl(locale, ""),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: tNav("portfolio"),
            item: absoluteUrl(locale, "/portfoy"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tr.title,
            item: listingUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="pt-[72px]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container pt-10">
        <Link
          href="/portfoy"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {t("overview")}
        </Link>
      </div>

      <section className="container pt-6 pb-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">
                {tRegions(property.region)} · {t(`type.${property.type}`)} ·{" "}
                {t(`status.${property.status}`)}
              </div>
              <h1 className="mt-3 max-w-3xl font-display text-display-lg text-ink text-balance">
                {tr.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-3 sm:items-center">
              <FavoriteButton id={property.id} propertyLabel={tr.title} />
              <PropertyDetailPrice
                amount={property.price}
                currency={property.currency}
              />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container">
        <Reveal>
          <PropertyGallery images={gallery} alt={tr.title} />
        </Reveal>
      </section>

      <section className="container pt-16 pb-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7 xl:col-span-8">
            {specs.length > 0 && (
              <Reveal>
                <div className="grid grid-cols-2 gap-0 border-y border-ivory-300 md:grid-cols-4">
                  {specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col gap-2 border-r border-ivory-300 py-6 pl-0 last:border-r-0 md:px-6 md:first:pl-0"
                    >
                      <s.icon className="h-4 w-4 text-ink-muted" />
                      <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                        {s.label}
                      </div>
                      <div className="font-display text-2xl text-ink">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <h2 className="font-display text-display-md text-ink">
                {t("overview")}
              </h2>
              <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-ink-muted">
                {tr.description}
              </div>

              {tr.highlights.length > 0 && (
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {tr.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-3 border-l border-olive/40 pl-4 text-sm text-ink"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>

            {property.features.length > 0 && (
              <Reveal>
                <h2 className="font-display text-display-md text-ink">
                  {t("specs")}
                </h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  {property.features.map((f) => (
                    <span key={f} className="chip">
                      {t(`feature.${f}`)}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            {(property.media.virtualTourUrl || property.media.videoUrl) && (
              <Reveal>
                <h2 className="font-display text-display-md text-ink">
                  {property.media.virtualTourUrl
                    ? t("virtualTour")
                    : t("video")}
                </h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {property.media.virtualTourUrl && (
                    <VirtualTourModal url={property.media.virtualTourUrl} />
                  )}
                  {property.media.videoUrl && (
                    <a
                      href={property.media.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                    >
                      {t("video")}
                    </a>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xs border border-ivory-300 bg-ivory-50 p-6">
                <InquiryForm
                  propertyId={property.id}
                  propertySlug={property.slug}
                  defaultMessage={`${tr.title} — ${t("contactAgent")}`}
                />
                <div className="mt-4 border-t border-ivory-300 pt-4">
                  <WhatsAppButton
                    message={`${tr.title} · ${t("ref")}: ${property.id}`}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
