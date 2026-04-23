"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  LOCALES,
  PROPERTY_FEATURES,
  PROPERTY_REGIONS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  emptyPropertyInput,
  type LocaleKey,
  type PropertyInput,
} from "@/types/property";
import { cn, slugify } from "@/lib/utils";
import { Star, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";

type FormValues = PropertyInput;

export function PropertyForm({
  id,
  initial,
}: {
  id?: string;
  initial?: FormValues;
}) {
  const t = useTranslations("admin.properties");
  const tFields = useTranslations("admin.properties.fields");
  const tType = useTranslations("property.type");
  const tStatus = useTranslations("property.status");
  const tRegion = useTranslations("regions");
  const tFeature = useTranslations("property.feature");
  const tLang = useTranslations("language");

  const router = useRouter();
  const [values, setValues] = useState<FormValues>(
    initial ?? emptyPropertyInput(),
  );
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("tr");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const setSpec = (key: keyof FormValues["specs"], val: number | null) =>
    setValues((v) => ({ ...v, specs: { ...v.specs, [key]: val } }));

  const setTranslation = (
    locale: LocaleKey,
    key: "title" | "description" | "highlights",
    value: string | string[],
  ) =>
    setValues((v) => ({
      ...v,
      translations: {
        ...v.translations,
        [locale]: { ...v.translations[locale], [key]: value },
      },
    }));

  const toggleFeature = (f: (typeof PROPERTY_FEATURES)[number]) =>
    setValues((v) => ({
      ...v,
      features: v.features.includes(f)
        ? v.features.filter((x) => x !== f)
        : [...v.features, f],
    }));

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", `properties/${values.slug || "unsorted"}`);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        urls.push(data.url);
      }
    }
    setValues((v) => ({
      ...v,
      media: {
        ...v.media,
        cover: v.media.cover ?? urls[0] ?? null,
        gallery: [...v.media.gallery, ...urls],
      },
    }));
  };

  const setCover = (url: string) =>
    setValues((v) => ({ ...v, media: { ...v.media, cover: url } }));

  const removeMedia = (url: string) =>
    setValues((v) => ({
      ...v,
      media: {
        cover: v.media.cover === url ? null : v.media.cover,
        gallery: v.media.gallery.filter((g) => g !== url),
        videoUrl: v.media.videoUrl,
        virtualTourUrl: v.media.virtualTourUrl,
      },
    }));

  const copyFromTr = (target: LocaleKey) => {
    if (target === "tr") return;
    setValues((v) => ({
      ...v,
      translations: {
        ...v.translations,
        [target]: { ...v.translations.tr },
      },
    }));
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const url = id
        ? `/api/admin/properties/${id}`
        : "/api/admin/properties";
      const method = id ? "PUT" : "POST";
      const payload: PropertyInput = {
        ...values,
        slug: values.slug || slugify(values.translations.tr.title),
        translations: (() => {
          const out: FormValues["translations"] = values.translations;
          return out;
        })(),
      };
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed");
      }
      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!id) return;
    if (!confirm(t("confirmDelete"))) return;
    setSaving(true);
    await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    router.push("/admin/properties");
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">
          {id ? t("formTitle.edit") : t("formTitle.new")}
        </h1>
        <div className="flex items-center gap-2">
          {id && (
            <button
              type="button"
              onClick={del}
              className="btn btn-ghost text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> {t("delete")}
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/admin/properties")}
            className="btn btn-ghost"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? "..." : t("save")}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xs border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Section title={t("sections.basic")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={tFields("slug")}>
            <input
              className="field"
              value={values.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </Field>
          <Field label={tFields("price")}>
            <input
              type="number"
              className="field"
              value={values.price || ""}
              onChange={(e) => set("price", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label={tFields("type")}>
            <select
              className="field"
              value={values.type}
              onChange={(e) => set("type", e.target.value as FormValues["type"])}
            >
              {PROPERTY_TYPES.map((x) => (
                <option key={x} value={x}>
                  {tType(x)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tFields("status")}>
            <select
              className="field"
              value={values.status}
              onChange={(e) => set("status", e.target.value as FormValues["status"])}
            >
              {PROPERTY_STATUSES.map((x) => (
                <option key={x} value={x}>
                  {tStatus(x)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tFields("region")}>
            <select
              className="field"
              value={values.region}
              onChange={(e) =>
                set("region", e.target.value as FormValues["region"])
              }
            >
              {PROPERTY_REGIONS.map((x) => (
                <option key={x} value={x}>
                  {tRegion(x)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tFields("featured")}>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ink"
                checked={values.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              <Star className="h-4 w-4 text-ink-muted" />
              Öne çıkar
            </label>
          </Field>
        </div>
      </Section>

      <Section title={t("sections.translations")}>
        <div className="mb-4 flex gap-1 rounded-xs border border-ivory-300 bg-ivory-50 p-1">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLocale(l)}
              className={cn(
                "flex-1 rounded-xs px-3 py-2 text-xs uppercase tracking-[0.14em] transition-colors",
                activeLocale === l
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {tLang(l)}
            </button>
          ))}
        </div>

        {activeLocale !== "tr" && (
          <button
            type="button"
            onClick={() => copyFromTr(activeLocale)}
            className="btn btn-ghost btn-sm mb-4"
          >
            {t("copyFromTr")}
          </button>
        )}

        <div className="space-y-4">
          <Field label={tFields("title")}>
            <input
              className="field"
              value={values.translations[activeLocale].title}
              onChange={(e) =>
                setTranslation(activeLocale, "title", e.target.value)
              }
            />
          </Field>
          <Field label={tFields("description")}>
            <textarea
              rows={6}
              className="field resize-y"
              value={values.translations[activeLocale].description}
              onChange={(e) =>
                setTranslation(activeLocale, "description", e.target.value)
              }
            />
          </Field>
          <Field label={tFields("highlights")}>
            <textarea
              rows={4}
              className="field resize-y"
              value={values.translations[activeLocale].highlights.join("\n")}
              onChange={(e) =>
                setTranslation(
                  activeLocale,
                  "highlights",
                  e.target.value.split("\n").filter(Boolean),
                )
              }
            />
          </Field>
        </div>
      </Section>

      <Section title={t("sections.specs")}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={tFields("bedrooms")}>
            <input
              type="number"
              className="field"
              value={values.specs.bedrooms ?? ""}
              onChange={(e) =>
                setSpec("bedrooms", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label={tFields("bathrooms")}>
            <input
              type="number"
              className="field"
              value={values.specs.bathrooms ?? ""}
              onChange={(e) =>
                setSpec("bathrooms", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label={tFields("areaGross")}>
            <input
              type="number"
              className="field"
              value={values.specs.areaGross ?? ""}
              onChange={(e) =>
                setSpec("areaGross", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label={tFields("areaNet")}>
            <input
              type="number"
              className="field"
              value={values.specs.areaNet ?? ""}
              onChange={(e) =>
                setSpec("areaNet", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label={tFields("plotSize")}>
            <input
              type="number"
              className="field"
              value={values.specs.plotSize ?? ""}
              onChange={(e) =>
                setSpec("plotSize", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label={tFields("yearBuilt")}>
            <input
              type="number"
              className="field"
              value={values.specs.yearBuilt ?? ""}
              onChange={(e) =>
                setSpec("yearBuilt", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
        </div>
      </Section>

      <Section title={t("sections.features")}>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_FEATURES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeature(f)}
              className={cn(
                "inline-flex items-center rounded-xs border px-3 py-1.5 text-xs transition-colors",
                values.features.includes(f)
                  ? "border-ink bg-ink text-ivory"
                  : "border-ivory-300 bg-ivory-50 text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {tFeature(f)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("sections.media")}>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="btn btn-outline"
        >
          <Upload className="h-4 w-4" /> {t("uploadImages")}
        </button>
        <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-4">
          {values.media.gallery.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xs bg-ivory-200"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-ink/30 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setCover(url)}
                  className={cn(
                    "btn btn-sm bg-ivory text-ink",
                    values.media.cover === url && "bg-olive text-ivory",
                  )}
                  title={t("setCover")}
                >
                  <Star className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeMedia(url)}
                  className="btn btn-sm bg-ivory text-red-700"
                  title={t("remove")}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {values.media.cover === url && (
                <div className="absolute left-2 top-2 rounded-xs bg-ink px-2 py-0.5 text-[10px] uppercase tracking-wider text-ivory">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("sections.extras")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={tFields("virtualTourUrl")}>
            <input
              className="field"
              value={values.media.virtualTourUrl ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  media: {
                    ...v.media,
                    virtualTourUrl: e.target.value || null,
                  },
                }))
              }
              placeholder="https://my.matterport.com/show/?m=..."
            />
          </Field>
          <Field label={tFields("videoUrl")}>
            <input
              className="field"
              value={values.media.videoUrl ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  media: { ...v.media, videoUrl: e.target.value || null },
                }))
              }
              placeholder="https://..."
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xs border border-ivory-300 bg-ivory-50 p-8">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
