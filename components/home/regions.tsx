import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

export function Regions({
  tiles,
}: {
  tiles: Array<{ id: string; imageUrl: string }>;
}) {
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
          {tiles.map((tile, i) => (
            <Reveal key={tile.id} delay={(i % 4) * 0.06}>
              <Link
                href={`/portfoy?region=${encodeURIComponent(tile.id)}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-ivory-300">
                  <Image
                    src={tile.imageUrl}
                    alt={tRegions(tile.id)}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="font-display text-xl text-ivory">
                      {tRegions(tile.id)}
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
