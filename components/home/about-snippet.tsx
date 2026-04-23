import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function AboutSnippet() {
  const t = useTranslations("home");

  return (
    <section className="container py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5" delay={0.05}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-ivory-200">
            <Image
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80"
              alt="Bodrum"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal className="flex flex-col justify-center md:col-span-7" delay={0.1}>
          <div className="eyebrow">Bodrum · Ege</div>
          <h2 className="mt-4 font-display text-display-lg text-ink text-balance">
            {t("aboutTitle")}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
            {t("aboutBody")}
          </p>
          <div className="mt-8">
            <Link
              href="/hakkimizda"
              className="link-underline inline-flex items-center gap-1.5 text-sm"
            >
              {t("aboutCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
