"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "@/types/property";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "priceAsc" | "priceDesc";

export function PropertyFilters({
  resultCount,
  regionIds,
  featureIds,
}: {
  resultCount: number;
  regionIds: string[];
  featureIds: string[];
}) {
  const t = useTranslations("portfolio.filters");
  const tPortfolio = useTranslations("portfolio");
  const tType = useTranslations("property.type");
  const tStatus = useTranslations("property.status");
  const tRegions = useTranslations("regions");
  const tFeature = useTranslations("property.feature");

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const q = sp.toString();

  const replaceQuery = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(q);
      mutate(p);
      const qs = p.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, q, startTransition],
  );

  const type = sp.get("type") ?? "";
  const status = sp.get("status") ?? "";
  const region = sp.get("region") ?? "";
  const bedrooms = sp.get("bedrooms") ?? "";
  const featured = sp.get("featured") === "1";
  const sort = (sp.get("sort") as SortKey | null) ?? "newest";
  const features = useMemo(
    () => sp.get("features")?.split(",").filter(Boolean) ?? [],
    [sp],
  );

  const priceMinQ = sp.get("priceMin") ?? "";
  const priceMaxQ = sp.get("priceMax") ?? "";

  const [priceMin, setPriceMin] = useState(priceMinQ);
  const [priceMax, setPriceMax] = useState(priceMaxQ);

  useEffect(() => {
    const p = new URLSearchParams(q);
    setPriceMin(p.get("priceMin") ?? "");
    setPriceMax(p.get("priceMax") ?? "");
  }, [q]);

  const toggleFeature = (f: string) =>
    replaceQuery((p) => {
      const cur = p.get("features")?.split(",").filter(Boolean) ?? [];
      const next = cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f];
      if (next.length) p.set("features", next.join(","));
      else p.delete("features");
    });

  const applyPrice = (close: () => void) => {
    replaceQuery((p) => {
      if (priceMin.trim()) p.set("priceMin", priceMin.trim());
      else p.delete("priceMin");
      if (priceMax.trim()) p.set("priceMax", priceMax.trim());
      else p.delete("priceMax");
    });
    close();
  };

  const clearAll = () =>
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });

  const hasFilters = Boolean(
    type ||
      status ||
      region ||
      bedrooms ||
      featured ||
      features.length ||
      priceMinQ ||
      priceMaxQ ||
      sort !== "newest",
  );

  const moreCategories =
    (featured ? 1 : 0) +
    (bedrooms ? 1 : 0) +
    (priceMinQ || priceMaxQ ? 1 : 0) +
    (features.length > 0 ? 1 : 0);
  const morePreview =
    moreCategories === 0 ? t("any") : t("selectedShort", { count: moreCategories });
  const moreDirty = moreCategories > 0;

  const sortOnChange = (v: string) => {
    replaceQuery((p) => {
      if (v === "newest") p.delete("sort");
      else p.set("sort", v);
    });
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
          {tPortfolio("resultsCount", { count: resultCount })}
        </h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-ink-muted underline decoration-ink-muted/40 underline-offset-2 transition-colors hover:text-ink"
          >
            {t("clear")}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <label htmlFor="pf-sort" className="sr-only">
          {tPortfolio("sort.label")}
        </label>
        <select
          id="pf-sort"
          value={sort}
          onChange={(e) => sortOnChange(e.target.value)}
          className="field h-9 max-w-[min(100%,12rem)] shrink-0 cursor-pointer py-1.5 pl-2.5 pr-8 text-xs font-medium"
        >
          <option value="newest">{tPortfolio("sort.newest")}</option>
          <option value="priceAsc">{tPortfolio("sort.priceAsc")}</option>
          <option value="priceDesc">{tPortfolio("sort.priceDesc")}</option>
        </select>

        <FilterMenu
          label={t("type")}
          preview={type ? tType(type) : t("any")}
          dirty={Boolean(type)}
        >
          {({ close }) => (
            <div className="flex flex-wrap gap-1.5">
              <ChoiceChip
                compact
                active={!type}
                onClick={() => {
                  replaceQuery((p) => p.delete("type"));
                  close();
                }}
                label={t("any")}
              />
              {PROPERTY_TYPES.map((x) => (
                <ChoiceChip
                  compact
                  key={x}
                  active={type === x}
                  onClick={() => {
                    replaceQuery((p) => {
                      if (type === x) p.delete("type");
                      else p.set("type", x);
                    });
                    close();
                  }}
                  label={tType(x)}
                />
              ))}
            </div>
          )}
        </FilterMenu>

        <FilterMenu
          label={t("status")}
          preview={status ? tStatus(status) : t("any")}
          dirty={Boolean(status)}
        >
          {({ close }) => (
            <div className="flex flex-wrap gap-1.5">
              <ChoiceChip
                compact
                active={!status}
                onClick={() => {
                  replaceQuery((p) => p.delete("status"));
                  close();
                }}
                label={t("any")}
              />
              {PROPERTY_STATUSES.map((x) => (
                <ChoiceChip
                  compact
                  key={x}
                  active={status === x}
                  onClick={() => {
                    replaceQuery((p) => {
                      if (status === x) p.delete("status");
                      else p.set("status", x);
                    });
                    close();
                  }}
                  label={tStatus(x)}
                />
              ))}
            </div>
          )}
        </FilterMenu>

        <FilterMenu
          label={t("region")}
          preview={region ? tRegions(region) : t("any")}
          dirty={Boolean(region)}
        >
          {({ close }) => (
            <div className="flex flex-wrap gap-1.5">
              <ChoiceChip
                compact
                active={!region}
                onClick={() => {
                  replaceQuery((p) => p.delete("region"));
                  close();
                }}
                label={t("any")}
              />
              {regionIds.map((x) => (
                <ChoiceChip
                  compact
                  key={x}
                  active={region === x}
                  onClick={() => {
                    replaceQuery((p) => {
                      if (region === x) p.delete("region");
                      else p.set("region", x);
                    });
                    close();
                  }}
                  label={tRegions(x)}
                />
              ))}
            </div>
          )}
        </FilterMenu>

        <FilterMenu
          label={t("toolbarMore")}
          preview={morePreview}
          dirty={moreDirty}
          alignEnd
        >
          {({ close }) => (
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t("featured")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <ChoiceChip
                    compact
                    active={!featured}
                    onClick={() => {
                      replaceQuery((p) => p.delete("featured"));
                    }}
                    label={t("any")}
                  />
                  <ChoiceChip
                    compact
                    active={featured}
                    onClick={() => {
                      replaceQuery((p) => p.set("featured", "1"));
                    }}
                    label={t("featured")}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t("bedrooms")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <ChoiceChip
                    compact
                    active={!bedrooms}
                    onClick={() => {
                      replaceQuery((p) => p.delete("bedrooms"));
                    }}
                    label={t("any")}
                  />
                  {[1, 2, 3, 4, 5].map((x) => (
                    <ChoiceChip
                      compact
                      key={x}
                      active={bedrooms === String(x)}
                      onClick={() => {
                        replaceQuery((p) => {
                          if (bedrooms === String(x)) p.delete("bedrooms");
                          else p.set("bedrooms", String(x));
                        });
                      }}
                      label={`${x}+`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t("priceMin")} · {t("priceMax")}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      className="field py-1.5 text-xs"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder={t("priceMin")}
                      aria-label={t("priceMin")}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      className="field py-1.5 text-xs"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder={t("priceMax")}
                      aria-label={t("priceMax")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => applyPrice(close)}
                    className="btn btn-outline h-9 shrink-0 px-3 py-1.5 text-xs"
                  >
                    {t("apply")}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t("features")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {featureIds.map((f) => (
                    <ChoiceChip
                      compact
                      key={f}
                      active={features.includes(f)}
                      onClick={() => toggleFeature(f)}
                      label={tFeature(f)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </FilterMenu>
      </div>
    </div>
  );
}

function FilterMenu({
  label,
  preview,
  dirty,
  alignEnd,
  children,
}: {
  label: string;
  preview: string;
  dirty?: boolean;
  alignEnd?: boolean;
  children: (ctx: { close: () => void }) => ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  return (
    <details
      ref={ref}
      className={cn(
        "group relative shrink-0",
        alignEnd && "max-sm:ml-auto",
      )}
    >
      <summary
        title={`${label}: ${preview}`}
        className={cn(
          "inline-flex h-9 max-w-[min(100%,13.5rem)] cursor-pointer list-none items-center gap-1.5 rounded-xs border bg-white px-2.5 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-ivory-50 [&::-webkit-details-marker]:hidden sm:max-w-[15rem]",
          dirty ? "border-olive/50 ring-1 ring-olive/20" : "border-ink/12",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            dirty ? "bg-olive" : "bg-ivory-300",
          )}
          aria-hidden
        />
        <span className="shrink-0">{label}</span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate font-normal text-ink-muted">
          {preview}
        </span>
      </summary>
      <div
        className={cn(
          "absolute z-50 mt-1 max-h-[min(22rem,70vh)] w-[min(19rem,calc(100vw-2rem))] overflow-y-auto overscroll-y-contain rounded-xs border border-ivory-300 bg-white p-3 shadow-lg",
          alignEnd ? "right-0" : "left-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children({ close })}
      </div>
    </details>
  );
}

function ChoiceChip({
  active,
  onClick,
  label,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex max-w-full items-center rounded-xs border text-left font-medium transition-all",
        compact
          ? "min-h-8 px-2 py-1 text-[11px] leading-snug"
          : "min-h-9 px-3 py-2 text-xs leading-snug sm:min-h-8 sm:py-1.5",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-ink/12 bg-white text-ink hover:border-ink/25 hover:bg-ivory-50",
      )}
    >
      {label}
    </button>
  );
}
