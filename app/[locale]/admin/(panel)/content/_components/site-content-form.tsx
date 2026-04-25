"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Home,
  ListTree,
  Mail,
  Search,
  Sparkles,
} from "lucide-react";
import type { L10n, SiteContentV1 } from "@/types/site-content";
import { LOCALES, type LocaleKey } from "@/types/property";
import { cn } from "@/lib/utils";

type TabId =
  | "home"
  | "about"
  | "contact"
  | "favport"
  | "brand"
  | "seo";

function L10nField({
  label,
  hint,
  value,
  onChange,
  activeLocale,
  rows = 2,
}: {
  label: string;
  hint?: string;
  value: L10n;
  onChange: (loc: LocaleKey, v: string) => void;
  activeLocale: LocaleKey;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      {hint ? (
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
      <textarea
        className="mt-2 w-full rounded-lg border border-ivory-300 bg-ivory px-3 py-2.5 text-sm shadow-sm transition-shadow focus:border-olive/60 focus:outline-none focus:ring-2 focus:ring-olive/20"
        rows={rows}
        value={value[activeLocale] ?? ""}
        onChange={(e) => onChange(activeLocale, e.target.value)}
        spellCheck
      />
    </div>
  );
}

function ImageUrlField({
  label,
  hint,
  value,
  onUrlChange,
  onUpload,
  uploading,
  uploadLabel,
  urlHint,
  uploadButtonLabel,
}: {
  label: string;
  hint?: string;
  value: string;
  onUrlChange: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadLabel: string;
  urlHint: string;
  uploadButtonLabel: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      {hint ? (
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
      <p className="mt-1 text-xs text-ink-muted">{urlHint}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="url"
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-lg border border-ivory-300 bg-ivory px-3 py-2 text-sm shadow-sm focus:border-olive/60 focus:outline-none focus:ring-2 focus:ring-olive/20"
          value={value}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-ivory-300 bg-ivory-200 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-olive/40 hover:bg-ivory-100">
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
            className="sr-only"
          />
          {uploadButtonLabel}
        </label>
        {uploading && (
          <span className="self-center text-xs text-ink-muted">{uploadLabel}</span>
        )}
      </div>
    </div>
  );
}

function ContentSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ivory-300/90 bg-ivory shadow-sm">
      <div className="border-b border-ivory-200 bg-ivory-100/80 px-5 py-4">
        <h3 className="font-display text-base text-ink">{title}</h3>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </div>
  );
}

export function SiteContentForm({
  initial,
}: {
  initial: { content: SiteContentV1; updatedAt: string | null };
}) {
  const t = useTranslations("admin.content");
  const tLang = useTranslations("language");
  const [c, setC] = useState<SiteContentV1>(initial.content);
  const [editLocale, setEditLocale] = useState<LocaleKey>("tr");
  const [tab, setTab] = useState<TabId>("home");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState<string | null>(null);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploadKey(folder);
    setErr(null);
    try {
      const fd = new FormData();
      fd.set("file", f);
      fd.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Upload failed");
      return j.url ?? null;
    } catch (e) {
      setErr((e as Error).message);
      return null;
    } finally {
      setUploadKey(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? res.statusText);
      }
      setOk(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const tabs: {
    id: TabId;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "home", label: t("tabHome"), desc: t("tabDescHome"), icon: Home },
    { id: "about", label: t("tabAbout"), desc: t("tabDescAbout"), icon: BookOpen },
    { id: "contact", label: t("tabContact"), desc: t("tabDescContact"), icon: Mail },
    {
      id: "favport",
      label: t("tabFavoritesPortfolio"),
      desc: t("tabDescFavport"),
      icon: ListTree,
    },
    { id: "brand", label: t("tabBrand"), desc: t("tabDescBrand"), icon: Building2 },
    { id: "seo", label: t("tabSeo"), desc: t("tabDescSeo"), icon: Search },
  ];

  const activeTabConfig = tabs.find((x) => x.id === tab);

  return (
    <div className="relative max-w-4xl space-y-8 pb-28">
      <div className="rounded-2xl border border-olive/15 bg-gradient-to-br from-ivory to-ivory-100 p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive/10 text-olive">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{t("introShort")}</p>
            <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
              <li>{t("step1")}</li>
              <li>{t("step2")}</li>
              <li>{t("step3")}</li>
            </ol>
          </div>
        </div>
      </div>

      {initial.updatedAt && (
        <p className="text-xs text-ink-muted">
          {t("lastUpdated")}: {new Date(initial.updatedAt).toLocaleString()}
        </p>
      )}

      <div>
        <p className="text-sm font-medium text-ink">{t("editingLanguage")}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{t("editingLanguageHelp")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setEditLocale(loc)}
              className={cn(
                "min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-[0.98]",
                editLocale === loc
                  ? "border-olive bg-olive text-ivory shadow-sm"
                  : "border-ivory-300 bg-ivory text-ink-muted hover:border-olive/40 hover:text-ink",
              )}
            >
              {tLang(loc)}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-ivory-300">
        <div className="-mb-px flex snap-x snap-mandatory gap-1 overflow-x-auto pb-px [scrollbar-width:thin]">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex min-h-11 snap-start shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg border border-b-0 px-3 py-2.5 text-sm transition-colors",
                tab === id
                  ? "border-ivory-300 bg-ivory text-ink shadow-sm"
                  : "border-transparent text-ink-muted hover:bg-ivory-200/80",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTabConfig && (
        <p className="text-sm leading-relaxed text-ink-muted">{activeTabConfig.desc}</p>
      )}

      {tab === "home" && (
        <div className="space-y-4">
          <ContentSection
            title={t("secHomeHero")}
            description={t("sectionHeroHint")}
          >
            <ImageUrlField
              label={t("fieldHeroBackground")}
              urlHint={t("urlPasteHint")}
              uploadButtonLabel={t("uploadChoose")}
              value={c.home.hero.backgroundUrl}
              onUrlChange={(v) =>
                setC({
                  ...c,
                  home: { ...c.home, hero: { ...c.home.hero, backgroundUrl: v } },
                })
              }
              onUpload={async (e) => {
                const url = await upload(e, "site/hero");
                if (url) {
                  setC({
                    ...c,
                    home: {
                      ...c.home,
                      hero: { ...c.home.hero, backgroundUrl: url },
                    },
                  });
                }
              }}
              uploading={uploadKey === "site/hero"}
              uploadLabel={t("uploading")}
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldImageAlt")}
              value={c.home.hero.imageAlt}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: {
                      ...c.home.hero,
                      imageAlt: { ...c.home.hero.imageAlt, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldEyebrow")}
              value={c.home.hero.eyebrow}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: {
                      ...c.home.hero,
                      eyebrow: { ...c.home.hero.eyebrow, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldTitle")}
              value={c.home.hero.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: { ...c.home.hero, title: { ...c.home.hero.title, [loc]: v } },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldSubtitle")}
              value={c.home.hero.subtitle}
              rows={3}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: {
                      ...c.home.hero,
                      subtitle: { ...c.home.hero.subtitle, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldCta1")}
              value={c.home.hero.ctaPortfolio}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: {
                      ...c.home.hero,
                      ctaPortfolio: { ...c.home.hero.ctaPortfolio, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldCta2")}
              value={c.home.hero.ctaContact}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: {
                      ...c.home.hero,
                      ctaContact: { ...c.home.hero.ctaContact, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldDecorLine")}
              value={c.home.hero.decorLine}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    hero: {
                      ...c.home.hero,
                      decorLine: { ...c.home.hero.decorLine, [loc]: v },
                    },
                  },
                })
              }
            />
          </ContentSection>
          <ContentSection
            title={t("secFeatured")}
            description={t("sectionFeaturedHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldFeaturedTitle")}
              value={c.home.featured.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    featured: {
                      ...c.home.featured,
                      title: { ...c.home.featured.title, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldFeaturedSub")}
              value={c.home.featured.subtitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    featured: {
                      ...c.home.featured,
                      subtitle: { ...c.home.featured.subtitle, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldSeeAll")}
              value={c.home.featured.seeAll}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    featured: {
                      ...c.home.featured,
                      seeAll: { ...c.home.featured.seeAll, [loc]: v },
                    },
                  },
                })
              }
            />
          </ContentSection>
          <ContentSection
            title={t("secRegions")}
            description={t("sectionRegionsHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldRegionsTitle")}
              value={c.home.regions.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    regions: {
                      ...c.home.regions,
                      title: { ...c.home.regions.title, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldRegionsSub")}
              value={c.home.regions.subtitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    regions: {
                      ...c.home.regions,
                      subtitle: { ...c.home.regions.subtitle, [loc]: v },
                    },
                  },
                })
              }
            />
          </ContentSection>
          <ContentSection
            title={t("secHomeAbout")}
            description={t("sectionHomeAboutHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldAboutSnipTitle")}
              value={c.home.aboutSnippet.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    aboutSnippet: {
                      ...c.home.aboutSnippet,
                      title: { ...c.home.aboutSnippet.title, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldAboutSnipBody")}
              rows={4}
              value={c.home.aboutSnippet.body}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    aboutSnippet: {
                      ...c.home.aboutSnippet,
                      body: { ...c.home.aboutSnippet.body, [loc]: v },
                    },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldAboutSnipCta")}
              value={c.home.aboutSnippet.cta}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  home: {
                    ...c.home,
                    aboutSnippet: {
                      ...c.home.aboutSnippet,
                      cta: { ...c.home.aboutSnippet.cta, [loc]: v },
                    },
                  },
                })
              }
            />
          </ContentSection>
        </div>
      )}

      {tab === "about" && (
        <div className="space-y-4">
          <ContentSection
            title={t("secAboutPage")}
            description={t("sectionAboutPageHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldAboutHeroEyebrow")}
              value={c.aboutPage.heroEyebrow}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    heroEyebrow: { ...c.aboutPage.heroEyebrow, [loc]: v },
                  },
                })
              }
            />
            <ImageUrlField
              label={t("fieldSideImage")}
              urlHint={t("urlPasteHint")}
              uploadButtonLabel={t("uploadChoose")}
              value={c.aboutPage.sideImageUrl}
              onUrlChange={(v) =>
                setC({ ...c, aboutPage: { ...c.aboutPage, sideImageUrl: v } })
              }
              onUpload={async (e) => {
                const url = await upload(e, "site/about");
                if (url) {
                  setC({ ...c, aboutPage: { ...c.aboutPage, sideImageUrl: url } });
                }
              }}
              uploading={uploadKey === "site/about"}
              uploadLabel={t("uploading")}
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldSideImageAlt")}
              value={c.aboutPage.sideImageAlt}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    sideImageAlt: { ...c.aboutPage.sideImageAlt, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldTitle")}
              value={c.aboutPage.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    title: { ...c.aboutPage.title, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldSubtitle")}
              value={c.aboutPage.subtitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    subtitle: { ...c.aboutPage.subtitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldBody")}
              rows={5}
              value={c.aboutPage.body}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: { ...c.aboutPage, body: { ...c.aboutPage.body, [loc]: v } },
                })
              }
            />
            <p className="text-sm text-ink-muted">{t("sectionStatsHint")}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <div className="text-xs text-ink-muted">{t("fieldStatY")}</div>
                <input
                  className="mt-0.5 w-full rounded border border-ivory-300 bg-ivory px-2 py-1.5 text-sm"
                  value={c.aboutPage.statYears}
                  onChange={(e) =>
                    setC({
                      ...c,
                      aboutPage: { ...c.aboutPage, statYears: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <div className="text-xs text-ink-muted">{t("fieldStatA")}</div>
                <input
                  className="mt-0.5 w-full rounded border border-ivory-300 bg-ivory px-2 py-1.5 text-sm"
                  value={c.aboutPage.statAssets}
                  onChange={(e) =>
                    setC({
                      ...c,
                      aboutPage: { ...c.aboutPage, statAssets: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <div className="text-xs text-ink-muted">{t("fieldStatL")}</div>
                <input
                  className="mt-0.5 w-full rounded border border-ivory-300 bg-ivory px-2 py-1.5 text-sm"
                  value={c.aboutPage.statLangs}
                  onChange={(e) =>
                    setC({
                      ...c,
                      aboutPage: { ...c.aboutPage, statLangs: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <L10nField
              activeLocale={editLocale}
              label={t("fieldStatYLab")}
              value={c.aboutPage.statYearsLabel}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    statYearsLabel: { ...c.aboutPage.statYearsLabel, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldStatALab")}
              value={c.aboutPage.statAssetsLabel}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    statAssetsLabel: { ...c.aboutPage.statAssetsLabel, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldStatLLab")}
              value={c.aboutPage.statLangsLabel}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  aboutPage: {
                    ...c.aboutPage,
                    statLangsLabel: { ...c.aboutPage.statLangsLabel, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
        </div>
      )}

      {tab === "contact" && (
        <div className="space-y-4">
          <ContentSection
            title={t("secContact")}
            description={t("sectionContactHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldContactHeroEyebrow")}
              value={c.contactPage.heroEyebrow}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  contactPage: {
                    ...c.contactPage,
                    heroEyebrow: { ...c.contactPage.heroEyebrow, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldTitle")}
              value={c.contactPage.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  contactPage: {
                    ...c.contactPage,
                    title: { ...c.contactPage.title, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldSubtitle")}
              value={c.contactPage.subtitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  contactPage: {
                    ...c.contactPage,
                    subtitle: { ...c.contactPage.subtitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldFormTitle")}
              value={c.contactPage.formTitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  contactPage: {
                    ...c.contactPage,
                    formTitle: { ...c.contactPage.formTitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldAddress")}
              value={c.contactPage.addressLine}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  contactPage: {
                    ...c.contactPage,
                    addressLine: { ...c.contactPage.addressLine, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
        </div>
      )}

      {tab === "favport" && (
        <div className="space-y-4">
          <ContentSection
            title={t("secFav")}
            description={t("sectionFavHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldTitle")}
              value={c.favoritesPage.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  favoritesPage: {
                    ...c.favoritesPage,
                    title: { ...c.favoritesPage.title, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldSubtitle")}
              value={c.favoritesPage.subtitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  favoritesPage: {
                    ...c.favoritesPage,
                    subtitle: { ...c.favoritesPage.subtitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldEmpty")}
              value={c.favoritesPage.empty}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  favoritesPage: {
                    ...c.favoritesPage,
                    empty: { ...c.favoritesPage.empty, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldBrowsePort")}
              value={c.favoritesPage.browsePortfolio}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  favoritesPage: {
                    ...c.favoritesPage,
                    browsePortfolio: { ...c.favoritesPage.browsePortfolio, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
          <ContentSection
            title={t("secPortPage")}
            description={t("sectionPortPageHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldPortTitle")}
              value={c.portfolioPage.title}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  portfolioPage: {
                    ...c.portfolioPage,
                    title: { ...c.portfolioPage.title, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldPortSub")}
              value={c.portfolioPage.subtitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  portfolioPage: {
                    ...c.portfolioPage,
                    subtitle: { ...c.portfolioPage.subtitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldEmpty")}
              value={c.portfolioPage.empty}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  portfolioPage: {
                    ...c.portfolioPage,
                    empty: { ...c.portfolioPage.empty, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldCurrency")}
              value={c.portfolioPage.displayCurrency}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  portfolioPage: {
                    ...c.portfolioPage,
                    displayCurrency: { ...c.portfolioPage.displayCurrency, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
        </div>
      )}

      {tab === "brand" && (
        <div className="space-y-4">
          <ContentSection
            title={t("secBrand")}
            description={t("sectionBrandBlockHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldBrandName")}
              value={c.brand.name}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  brand: { ...c.brand, name: { ...c.brand.name, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldTagline")}
              value={c.brand.tagline}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  brand: { ...c.brand, tagline: { ...c.brand.tagline, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldHeaderMotto")}
              value={c.brand.headerMotto}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  brand: {
                    ...c.brand,
                    headerMotto: { ...c.brand.headerMotto, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
          <ContentSection
            title={t("secNav")}
            description={t("sectionNavBlockHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldNavHome")}
              value={c.nav.home}
              onChange={(loc, v) =>
                setC({ ...c, nav: { ...c.nav, home: { ...c.nav.home, [loc]: v } } })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldNavPort")}
              value={c.nav.portfolio}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  nav: { ...c.nav, portfolio: { ...c.nav.portfolio, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldNavAbout")}
              value={c.nav.about}
              onChange={(loc, v) =>
                setC({ ...c, nav: { ...c.nav, about: { ...c.nav.about, [loc]: v } } })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldNavContact")}
              value={c.nav.contact}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  nav: { ...c.nav, contact: { ...c.nav.contact, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldNavFav")}
              value={c.nav.favorites}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  nav: { ...c.nav, favorites: { ...c.nav.favorites, [loc]: v } },
                })
              }
            />
          </ContentSection>
          <ContentSection
            title={t("secFooter")}
            description={t("sectionFooterBlockHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("fieldLocationLine")}
              value={c.footer.locationLine}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  footer: {
                    ...c.footer,
                    locationLine: { ...c.footer.locationLine, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldRights")}
              value={c.footer.rights}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  footer: { ...c.footer, rights: { ...c.footer.rights, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("fieldQuickLinks")}
              value={c.footer.quickLinks}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  footer: {
                    ...c.footer,
                    quickLinks: { ...c.footer.quickLinks, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-4">
          <ContentSection
            title={t("secSeo")}
            description={t("sectionSeoHint")}
          >
            <L10nField
              activeLocale={editLocale}
              label={t("seoHomeTitle")}
              value={c.seo.homeTitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: { ...c.seo, homeTitle: { ...c.seo.homeTitle, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoHomeDesc")}
              rows={3}
              value={c.seo.homeDescription}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    homeDescription: { ...c.seo.homeDescription, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoPortTitle")}
              value={c.seo.portfolioTitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    portfolioTitle: { ...c.seo.portfolioTitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoPortDesc")}
              rows={3}
              value={c.seo.portfolioDescription}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    portfolioDescription: { ...c.seo.portfolioDescription, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoAboutTitle")}
              value={c.seo.aboutTitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: { ...c.seo, aboutTitle: { ...c.seo.aboutTitle, [loc]: v } },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoAboutDesc")}
              rows={3}
              value={c.seo.aboutDescription}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    aboutDescription: { ...c.seo.aboutDescription, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoContactTitle")}
              value={c.seo.contactTitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    contactTitle: { ...c.seo.contactTitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoContactDesc")}
              rows={3}
              value={c.seo.contactDescription}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    contactDescription: { ...c.seo.contactDescription, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoFavTitle")}
              value={c.seo.favoritesTitle}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    favoritesTitle: { ...c.seo.favoritesTitle, [loc]: v },
                  },
                })
              }
            />
            <L10nField
              activeLocale={editLocale}
              label={t("seoFavDesc")}
              rows={2}
              value={c.seo.favoritesDescription}
              onChange={(loc, v) =>
                setC({
                  ...c,
                  seo: {
                    ...c.seo,
                    favoritesDescription: { ...c.seo.favoritesDescription, [loc]: v },
                  },
                })
              }
            />
          </ContentSection>
        </div>
      )}

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-ivory-300 bg-ivory/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:left-[260px]"
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs text-ink-muted">
            {ok ? (
              <span className="inline-flex items-center gap-1.5 text-olive">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {t("saved")}
              </span>
            ) : null}
            {err ? (
              <span className="text-red-700">
                {t("error")}: {err}
              </span>
            ) : null}
            {!ok && !err ? <span>{t("saveBarHint")}</span> : null}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn btn-primary shrink-0 shadow-sm"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
