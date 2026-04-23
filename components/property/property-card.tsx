"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Property, LocaleKey } from "@/types/property";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { DisplayPrice } from "./display-price";

export function PropertyCard({
  property,
  priority = false,
  size = "default",
}: {
  property: Property;
  priority?: boolean;
  size?: "default" | "large" | "compact";
}) {
  const locale = useLocale() as LocaleKey;
  const t = useTranslations("property");
  const tRegions = useTranslations("regions");
  const translation =
    property.translations[locale] ?? property.translations.tr;

  const imgAspect =
    size === "large"
      ? "aspect-[4/5]"
      : size === "compact"
        ? "aspect-[4/3]"
        : "aspect-[5/6]";

  return (
    <article className="group relative">
      <Link
        href={`/portfoy/${property.slug}`}
        className="block"
        aria-label={translation.title}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xs bg-ivory-200",
            imgAspect,
          )}
        >
          {property.media.cover ? (
            <Image
              src={property.media.cover}
              alt={translation.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-80" />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="chip bg-ivory/90 text-ink border-transparent">
              {t(`status.${property.status}`)}
            </span>
            {property.featured && (
              <span className="chip bg-ink text-ivory border-transparent">
                ★
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="text-ivory">
              <div className="text-[11px] uppercase tracking-[0.2em] opacity-80">
                {tRegions(property.region)} · {t(`type.${property.type}`)}
              </div>
              <h3 className="mt-1 font-display text-2xl leading-tight text-balance">
                {translation.title}
              </h3>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute right-4 top-4">
        <FavoriteButton
          id={property.id}
          variant="overlay"
          propertyLabel={translation.title}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          {property.specs.bedrooms != null && (
            <span>
              {property.specs.bedrooms} {t("bedrooms").toLowerCase()}
            </span>
          )}
          {property.specs.areaGross != null && (
            <span>{property.specs.areaGross} m²</span>
          )}
        </div>
        <DisplayPrice
          amount={property.price}
          currency={property.currency}
          className="font-display text-lg text-ink"
        />
      </div>
    </article>
  );
}
