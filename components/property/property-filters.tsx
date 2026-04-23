"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import {
  PROPERTY_FEATURES,
  PROPERTY_REGIONS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "@/types/property";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyFilters() {
  const t = useTranslations("portfolio.filters");
  const tType = useTranslations("property.type");
  const tStatus = useTranslations("property.status");
  const tRegions = useTranslations("regions");
  const tFeature = useTranslations("property.feature");

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [type, setType] = useState(sp.get("type") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [region, setRegion] = useState(sp.get("region") ?? "");
  const [priceMin, setPriceMin] = useState(sp.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(sp.get("priceMax") ?? "");
  const [bedrooms, setBedrooms] = useState(sp.get("bedrooms") ?? "");
  const [featured, setFeatured] = useState(sp.get("featured") === "1");
  const [features, setFeatures] = useState<string[]>(
    sp.get("features")?.split(",").filter(Boolean) ?? [],
  );

  const toggleFeature = (f: string) =>
    setFeatures((curr) =>
      curr.includes(f) ? curr.filter((x) => x !== f) : [...curr, f],
    );

  const apply = () => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (region) params.set("region", region);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (featured) params.set("featured", "1");
    if (features.length) params.set("features", features.join(","));
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      setOpen(false);
    });
  };

  const clear = () => {
    setType("");
    setStatus("");
    setRegion("");
    setPriceMin("");
    setPriceMax("");
    setBedrooms("");
    setFeatured(false);
    setFeatures([]);
    startTransition(() => router.push(pathname, { scroll: false }));
  };

  const activeCount = [
    type,
    status,
    region,
    priceMin,
    priceMax,
    bedrooms,
    featured ? "1" : "",
    ...features,
  ].filter(Boolean).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline"
      >
        <Filter className="h-4 w-4" /> {t("title")}
        {activeCount > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-ink px-1.5 text-[10px] text-ivory">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/30 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col bg-ivory shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ivory-300 px-6 py-4">
              <h2 className="font-display text-2xl">{t("title")}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xs hover:bg-ivory-200"
                aria-label="close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div>
                <label className="label">{t("type")}</label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!type}
                    onClick={() => setType("")}
                    label={t("any")}
                  />
                  {PROPERTY_TYPES.map((x) => (
                    <FilterChip
                      key={x}
                      active={type === x}
                      onClick={() => setType(x)}
                      label={tType(x)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">{t("status")}</label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!status}
                    onClick={() => setStatus("")}
                    label={t("any")}
                  />
                  {PROPERTY_STATUSES.map((x) => (
                    <FilterChip
                      key={x}
                      active={status === x}
                      onClick={() => setStatus(x)}
                      label={tStatus(x)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">{t("region")}</label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!region}
                    onClick={() => setRegion("")}
                    label={t("any")}
                  />
                  {PROPERTY_REGIONS.map((x) => (
                    <FilterChip
                      key={x}
                      active={region === x}
                      onClick={() => setRegion(x)}
                      label={tRegions(x)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t("priceMin")}</label>
                  <input
                    type="number"
                    className="field"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="€"
                  />
                </div>
                <div>
                  <label className="label">{t("priceMax")}</label>
                  <input
                    type="number"
                    className="field"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="€"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t("bedrooms")}</label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!bedrooms}
                    onClick={() => setBedrooms("")}
                    label={t("any")}
                  />
                  {[1, 2, 3, 4, 5].map((x) => (
                    <FilterChip
                      key={x}
                      active={bedrooms === String(x)}
                      onClick={() => setBedrooms(String(x))}
                      label={`${x}+`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">{t("features")}</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_FEATURES.map((f) => (
                    <FilterChip
                      key={f}
                      active={features.includes(f)}
                      onClick={() => toggleFeature(f)}
                      label={tFeature(f)}
                    />
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-ink"
                />
                {t("featured")}
              </label>
            </div>

            <div className="flex gap-3 border-t border-ivory-300 px-6 py-4">
              <button
                type="button"
                onClick={clear}
                className="btn btn-ghost flex-1"
              >
                {t("clear")}
              </button>
              <button
                type="button"
                onClick={apply}
                className="btn btn-primary flex-1"
              >
                {t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-xs border px-3 py-1.5 text-xs transition-all",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-ivory-300 bg-ivory-50 text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
