import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import type { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/property-card";
import { Reveal } from "@/components/motion/reveal";

export function FeaturedProperties({ items }: { items: Property[] }) {
  const t = useTranslations("home");

  if (items.length === 0) return null;

  return (
    <section className="container py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <div>
            <div className="eyebrow">{t("featuredSubtitle")}</div>
            <h2 className="mt-3 font-display text-display-md text-ink text-balance">
              {t("featuredTitle")}
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href="/portfoy"
            className="link-underline inline-flex items-center gap-1.5 text-sm"
          >
            {t("seeAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((property, i) => (
          <Reveal key={property.id} delay={i * 0.08}>
            <PropertyCard property={property} priority={i < 3} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
