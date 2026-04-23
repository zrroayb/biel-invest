import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-ink">
      <Image
        src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/20 to-ink/70" />

      <div className="relative z-10 flex min-h-[92vh] items-end">
        <div className="container pb-20 pt-36">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.28em] text-ivory/70">
              {t("heroEyebrow")}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-5xl font-display text-display-xl text-ivory text-balance">
              {t("heroTitle")}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base text-ivory/80 md:text-lg">
              {t("heroSubtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
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
          </Reveal>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-8 z-10 hidden font-display text-ivory/50 md:block">
        <div className="text-[10px] uppercase tracking-[0.32em]">
          Ege · 37.0344°N 27.4305°E
        </div>
      </div>
    </section>
  );
}
