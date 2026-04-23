"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Property } from "@/types/property";
import { useFavorites } from "@/lib/favorites";
import { PropertyCard } from "@/components/property/property-card";
import { Reveal } from "@/components/motion/reveal";

export default function FavoritesPage() {
  const t = useTranslations("favorites");
  const { ids, clear, ready } = useFavorites();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    fetch("/api/properties/by-ids", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [ready, ids]);

  return (
    <div className="pt-[72px]">
      <section className="border-b border-ivory-300 bg-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Bodrum · Ege</div>
                <h1 className="mt-3 font-display text-display-lg text-ink">
                  {t("title")}
                </h1>
                <p className="mt-3 text-base text-ink-muted">{t("subtitle")}</p>
              </div>
              {ids.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="btn btn-ghost btn-sm"
                >
                  {t("clear")}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container py-16">
        {!ready || loading ? (
          <div className="py-24 text-center text-ink-muted">...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="font-display text-2xl text-ink">{t("empty")}</div>
            <Link href="/portfoy" className="btn btn-outline">
              {t("browsePortfolio")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.05}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
