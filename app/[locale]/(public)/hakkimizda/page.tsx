import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="pt-[72px]">
      <section className="border-b border-ivory-300 bg-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="eyebrow">Bodrum · Ege</div>
            <h1 className="mt-3 max-w-3xl font-display text-display-lg text-ink">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xs bg-ivory-200">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                alt="Bodrum villa"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal className="md:col-span-7" delay={0.1}>
            <div className="max-w-xl">
              <p className="text-lg leading-relaxed text-ink">{t("body")}</p>
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-ivory-300 pt-10 md:grid-cols-3">
                <div>
                  <div className="font-display text-3xl text-ink">12+</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
                    Yıl
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl text-ink">80+</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
                    Varlık
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl text-ink">4</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
                    Dil
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
