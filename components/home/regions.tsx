import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { PROPERTY_REGIONS } from "@/types/property";

const REGION_IMAGES: Record<string, string> = {
  yalikavak:
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  turkbuku:
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1200&q=80",
  gumusluk:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80",
  golturkbuku:
    "https://images.unsplash.com/photo-1537726235470-8504e3beef77?auto=format&fit=crop&w=1200&q=80",
  yali: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  bodrumMerkez:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  gundogan:
    "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=80",
  torba:
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
};

export function Regions() {
  const t = useTranslations("home");
  const tRegions = useTranslations("regions");

  return (
    <section className="bg-ivory-200/60 py-24 md:py-32">
      <div className="container">
        <Reveal>
          <div className="max-w-xl">
            <div className="eyebrow">{t("regionsSubtitle")}</div>
            <h2 className="mt-3 font-display text-display-md text-ink">
              {t("regionsTitle")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROPERTY_REGIONS.map((region, i) => (
            <Reveal key={region} delay={(i % 4) * 0.06}>
              <Link
                href={`/portfoy?region=${region}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-ivory-300">
                  <Image
                    src={REGION_IMAGES[region]}
                    alt={tRegions(region)}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="font-display text-xl text-ivory">
                      {tRegions(region)}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ivory/70">
                      Bodrum
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
