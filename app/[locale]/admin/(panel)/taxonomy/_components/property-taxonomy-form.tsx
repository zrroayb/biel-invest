"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { LOCALES, type LocaleKey } from "@/types/property";
import { REGION_ID_RE, FEATURE_ID_RE, labelOrFallback } from "@/types/property-taxonomy";
import type { PropertyTaxonomyV1 } from "@/types/property-taxonomy";
import type { L10n } from "@/types/site-content";
import { useLocale } from "next-intl";

function emptyL10n(): L10n {
  return { tr: "", en: "", de: "", ru: "" };
}

export function PropertyTaxonomyForm({
  initial,
}: {
  initial: { taxonomy: PropertyTaxonomyV1; updatedAt: string | null };
}) {
  const t = useTranslations("admin.taxonomy");
  const tLang = useTranslations("language");
  const uiLocale = useLocale();
  const [c, setC] = useState<PropertyTaxonomyV1>(initial.taxonomy);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const setLabel = (
    kind: "regions" | "features",
    index: number,
    loc: LocaleKey,
    value: string,
  ) => {
    setC((prev) => {
      const list = [...prev[kind]];
      const row = { ...list[index]! };
      row.labels = { ...row.labels, [loc]: value };
      list[index] = row as (typeof list)[0];
      return { ...prev, [kind]: list };
    });
  };

  const addRegion = () => {
    setC((p) => ({
      ...p,
      regions: [
        ...p.regions,
        { id: "yeni_bolge", labels: emptyL10n() },
      ],
    }));
  };
  const addFeature = () => {
    setC((p) => ({
      ...p,
      features: [
        ...p.features,
        { id: "yeni_ozellik", labels: emptyL10n() },
      ],
    }));
  };

  const save = async () => {
    setErr(null);
    setOk(false);
    setSaving(true);
    try {
      for (const r of c.regions) {
        if (!REGION_ID_RE.test(r.id)) {
          setErr(t("errorBadRegionId", { id: r.id }));
          setSaving(false);
          return;
        }
        if (!r.labels.tr?.trim()) {
          setErr(t("errorTrLabelRegion", { id: r.id }));
          setSaving(false);
          return;
        }
      }
      for (const f of c.features) {
        if (!FEATURE_ID_RE.test(f.id)) {
          setErr(t("errorBadFeatureId", { id: f.id }));
          setSaving(false);
          return;
        }
        if (!f.labels.tr?.trim()) {
          setErr(t("errorTrLabelFeature", { id: f.id }));
          setSaving(false);
          return;
        }
      }
      const res = await fetch("/api/admin/property-taxonomy", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version: 1, regions: c.regions, features: c.features }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(d.error ?? t("errorSave"));
        return;
      }
      setOk(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative max-w-4xl space-y-10 pb-28">
      <div className="rounded-2xl border border-olive/15 bg-gradient-to-br from-ivory to-ivory-100 p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive/10 text-olive">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink">{t("intro")}</p>
            <p className="mt-1 text-sm text-ink-muted">{t("introHint")}</p>
            {initial.updatedAt ? (
              <p className="mt-2 text-xs text-ink-muted">
                {t("lastUpdated")}: {new Date(initial.updatedAt).toLocaleString(uiLocale)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-ink flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-olive" />
              {t("sections.regions")}
            </h2>
            <p className="text-sm text-ink-muted">{t("regionHint")}</p>
          </div>
          <button type="button" onClick={addRegion} className="btn btn-outline btn-sm inline-flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> {t("addRegion")}
          </button>
        </div>
        <div className="space-y-6">
          {c.regions.map((r, i) => (
            <div
              key={`${r.id}-${i}`}
              className="rounded-xl border border-ivory-300 bg-ivory p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="w-40 rounded border border-ivory-300 bg-ivory px-2 py-1 font-mono text-sm"
                    value={r.id}
                    onChange={(e) =>
                      setC((p) => {
                        const n = [...p.regions];
                        n[i] = { ...n[i]!, id: e.target.value };
                        return { ...p, regions: n };
                      })
                    }
                    spellCheck={false}
                  />
                  <span className="text-xs text-ink-muted">
                    {t("preview", {
                      name: labelOrFallback(r.labels, "tr", r.id),
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 text-ink-muted hover:bg-ivory-200"
                    onClick={() =>
                      i > 0 &&
                      setC((p) => {
                        const n = [...p.regions];
                        [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                        return { ...p, regions: n };
                      })
                    }
                    disabled={i === 0}
                    title={t("moveUp")}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-ink-muted hover:bg-ivory-200"
                    onClick={() =>
                      i < c.regions.length - 1 &&
                      setC((p) => {
                        const n = [...p.regions];
                        [n[i], n[i + 1]] = [n[i + 1]!, n[i]!];
                        return { ...p, regions: n };
                      })
                    }
                    disabled={i === c.regions.length - 1}
                    title={t("moveDown")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-red-700/80 hover:bg-red-50"
                    onClick={() =>
                      setC((p) => ({
                        ...p,
                        regions: p.regions.filter((_, j) => j !== i),
                      }))
                    }
                    title={t("remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <label className="mb-1 block text-xs text-ink-muted">{t("regionImageUrl")}</label>
              <input
                className="mb-3 w-full rounded border border-ivory-300 bg-ivory px-2 py-1.5 text-sm"
                placeholder="https://…"
                value={r.imageUrl ?? ""}
                onChange={(e) =>
                  setC((p) => {
                    const n = [...p.regions];
                    n[i] = { ...n[i]!, imageUrl: e.target.value || undefined };
                    return { ...p, regions: n };
                  })
                }
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {LOCALES.map((loc) => (
                  <div key={loc}>
                    <label className="text-xs text-ink-muted">{tLang(loc)}</label>
                    <input
                      className="mt-1 w-full rounded border border-ivory-300 bg-ivory px-2 py-1.5 text-sm"
                      value={r.labels[loc] ?? ""}
                      onChange={(e) => setLabel("regions", i, loc, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-ink flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-olive" />
              {t("sections.features")}
            </h2>
            <p className="text-sm text-ink-muted">{t("featureHint")}</p>
          </div>
          <button type="button" onClick={addFeature} className="btn btn-outline btn-sm inline-flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> {t("addFeature")}
          </button>
        </div>
        <div className="space-y-6">
          {c.features.map((f, i) => (
            <div
              key={`${f.id}-${i}`}
              className="rounded-xl border border-ivory-300 bg-ivory p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="w-40 rounded border border-ivory-300 bg-ivory px-2 py-1 font-mono text-sm"
                    value={f.id}
                    onChange={(e) =>
                      setC((p) => {
                        const n = [...p.features];
                        n[i] = { ...n[i]!, id: e.target.value };
                        return { ...p, features: n };
                      })
                    }
                    spellCheck={false}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 text-ink-muted hover:bg-ivory-200"
                    onClick={() =>
                      i > 0 &&
                      setC((p) => {
                        const n = [...p.features];
                        [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                        return { ...p, features: n };
                      })
                    }
                    disabled={i === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-ink-muted hover:bg-ivory-200"
                    onClick={() =>
                      i < c.features.length - 1 &&
                      setC((p) => {
                        const n = [...p.features];
                        [n[i], n[i + 1]] = [n[i + 1]!, n[i]!];
                        return { ...p, features: n };
                      })
                    }
                    disabled={i === c.features.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-red-700/80 hover:bg-red-50"
                    onClick={() =>
                      setC((p) => ({
                        ...p,
                        features: p.features.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {LOCALES.map((loc) => (
                  <div key={loc}>
                    <label className="text-xs text-ink-muted">{tLang(loc)}</label>
                    <input
                      className="mt-1 w-full rounded border border-ivory-300 bg-ivory px-2 py-1.5 text-sm"
                      value={f.labels[loc] ?? ""}
                      onChange={(e) => setLabel("features", i, loc, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ivory-300 bg-ivory/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:left-[260px]">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs text-ink-muted">
            {ok ? (
              <span className="inline-flex items-center gap-1.5 text-olive">
                <CheckCircle2 className="h-4 w-4" />
                {t("saved")}
              </span>
            ) : null}
            {err ? <span className="text-red-700">{err}</span> : null}
            {!ok && !err ? <span>{t("saveBarHint")}</span> : null}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving || c.regions.length === 0 || c.features.length === 0}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
