"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { isLoadableImageUrl } from "@/lib/seo/urls";
import { ArrowRight } from "lucide-react";

/** Matches default in `messages/*.json` when CMS / Firestore has an empty or bad URL. */
const FALLBACK_HERO_BACKGROUND =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1920&q=75";

export function Hero() {
  const t = useTranslations("home");
  const bg = t("heroBackgroundUrl");
  const src = isLoadableImageUrl(bg) ? bg : FALLBACK_HERO_BACKGROUND;

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-ink">
      <Image
        src={src}
        alt={t("heroImageAlt")}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        unoptimized
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/20 to-ink/70" />

      <div className="relative z-10 flex min-h-[92vh] items-end">
        <div className="container pb-20 pt-36">
          <div className="text-[11px] uppercase tracking-[0.28em] text-ivory/70">
            {t("heroEyebrow")}
          </div>
          <h1 className="mt-6 max-w-5xl font-display text-display-xl text-ivory text-balance">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-base text-ivory/80 md:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/portfoy"
              className="btn btn-primary bg-ivory text-ink hover:bg-sand"
            >
              {t("heroCtaPortfolio")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/iletisim"
              className="btn border border-ivory/50 text-ivory hover:bg-ivory hover:text-ink"
            >
              {t("heroCtaContact")}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-8 z-10 hidden font-display text-ivory/50 md:block">
        <div className="text-[10px] uppercase tracking-[0.32em]">
          {t("heroDecorLine")}
        </div>
      </div>
    </section>
  );
}
