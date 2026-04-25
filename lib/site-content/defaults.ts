import "server-only";

import { deepMerge } from "@/lib/merge-messages";
import { loadPublicFormBaseForLocale } from "@/lib/messages/public-defaults";
import { LOCALES, type LocaleKey } from "@/types/property";
import type { L10n, SiteContentV1 } from "@/types/site-content";

type Messages = Record<string, unknown>;

function getIn(m: Messages, path: string[]): string {
  let cur: unknown = m;
  for (const p of path) {
    cur = (cur as Record<string, unknown>)?.[p];
  }
  return typeof cur === "string" ? cur : "";
}

function l10n(
  byLoc: Record<LocaleKey, Messages>,
  path: string[],
): L10n {
  const o: L10n = {};
  for (const loc of LOCALES) {
    o[loc] = getIn(byLoc[loc]!, path);
  }
  return o;
}

export async function buildDefaultSiteContentFromMessages(): Promise<SiteContentV1> {
  const byLoc = {} as Record<LocaleKey, Messages>;
  for (const loc of LOCALES) {
    byLoc[loc] = (await loadPublicFormBaseForLocale(
      loc,
    )) as unknown as Messages;
  }
  const tr = byLoc.tr!;

  return {
    version: 1,
    home: {
      hero: {
        backgroundUrl: getIn(tr, ["home", "heroBackgroundUrl"]),
        imageAlt: l10n(byLoc, ["home", "heroImageAlt"]),
        eyebrow: l10n(byLoc, ["home", "heroEyebrow"]),
        title: l10n(byLoc, ["home", "heroTitle"]),
        subtitle: l10n(byLoc, ["home", "heroSubtitle"]),
        ctaPortfolio: l10n(byLoc, ["home", "heroCtaPortfolio"]),
        ctaContact: l10n(byLoc, ["home", "heroCtaContact"]),
        decorLine: l10n(byLoc, ["home", "heroDecorLine"]),
      },
      featured: {
        title: l10n(byLoc, ["home", "featuredTitle"]),
        subtitle: l10n(byLoc, ["home", "featuredSubtitle"]),
        seeAll: l10n(byLoc, ["home", "seeAll"]),
      },
      regions: {
        title: l10n(byLoc, ["home", "regionsTitle"]),
        subtitle: l10n(byLoc, ["home", "regionsSubtitle"]),
      },
      aboutSnippet: {
        title: l10n(byLoc, ["home", "aboutTitle"]),
        body: l10n(byLoc, ["home", "aboutBody"]),
        cta: l10n(byLoc, ["home", "aboutCta"]),
      },
    },
    aboutPage: {
      heroEyebrow: l10n(byLoc, ["about", "heroEyebrow"]),
      sideImageUrl: getIn(tr, ["about", "sideImageUrl"]),
      sideImageAlt: l10n(byLoc, ["about", "sideImageAlt"]),
      title: l10n(byLoc, ["about", "title"]),
      subtitle: l10n(byLoc, ["about", "subtitle"]),
      body: l10n(byLoc, ["about", "body"]),
      statYears: getIn(tr, ["about", "statYears"]),
      statAssets: getIn(tr, ["about", "statAssets"]),
      statLangs: getIn(tr, ["about", "statLangs"]),
      statYearsLabel: l10n(byLoc, ["about", "statYearsLabel"]),
      statAssetsLabel: l10n(byLoc, ["about", "statAssetsLabel"]),
      statLangsLabel: l10n(byLoc, ["about", "statLangsLabel"]),
    },
    contactPage: {
      heroEyebrow: l10n(byLoc, ["contact", "heroEyebrow"]),
      title: l10n(byLoc, ["contact", "title"]),
      subtitle: l10n(byLoc, ["contact", "subtitle"]),
      formTitle: l10n(byLoc, ["contact", "form", "title"]),
      addressLine: l10n(byLoc, ["contact", "addressLine"]),
    },
    favoritesPage: {
      title: l10n(byLoc, ["favorites", "title"]),
      subtitle: l10n(byLoc, ["favorites", "subtitle"]),
      empty: l10n(byLoc, ["favorites", "empty"]),
      browsePortfolio: l10n(byLoc, ["favorites", "browsePortfolio"]),
    },
    portfolioPage: {
      title: l10n(byLoc, ["portfolio", "title"]),
      subtitle: l10n(byLoc, ["portfolio", "subtitle"]),
      empty: l10n(byLoc, ["portfolio", "empty"]),
      displayCurrency: l10n(byLoc, ["portfolio", "displayCurrency"]),
    },
    brand: {
      name: l10n(byLoc, ["brand", "name"]),
      tagline: l10n(byLoc, ["brand", "tagline"]),
      headerMotto: l10n(byLoc, ["brand", "headerMotto"]),
    },
    nav: {
      home: l10n(byLoc, ["nav", "home"]),
      portfolio: l10n(byLoc, ["nav", "portfolio"]),
      about: l10n(byLoc, ["nav", "about"]),
      contact: l10n(byLoc, ["nav", "contact"]),
      favorites: l10n(byLoc, ["nav", "favorites"]),
    },
    footer: {
      locationLine: l10n(byLoc, ["footer", "locationLine"]),
      rights: l10n(byLoc, ["footer", "rights"]),
      quickLinks: l10n(byLoc, ["footer", "quickLinks"]),
    },
    seo: {
      homeTitle: l10n(byLoc, ["seo", "homeTitle"]),
      homeDescription: l10n(byLoc, ["seo", "homeDescription"]),
      portfolioTitle: l10n(byLoc, ["seo", "portfolioTitle"]),
      portfolioDescription: l10n(byLoc, ["seo", "portfolioDescription"]),
      aboutTitle: l10n(byLoc, ["seo", "aboutTitle"]),
      aboutDescription: l10n(byLoc, ["seo", "aboutDescription"]),
      contactTitle: l10n(byLoc, ["seo", "contactTitle"]),
      contactDescription: l10n(byLoc, ["seo", "contactDescription"]),
      favoritesTitle: l10n(byLoc, ["seo", "favoritesTitle"]),
      favoritesDescription: l10n(byLoc, ["seo", "favoritesDescription"]),
    },
  };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function mergeSiteContent(
  def: SiteContentV1,
  fromDb: unknown,
): SiteContentV1 {
  if (!isPlainObject(fromDb)) return def;
  return deepMerge(
    def as unknown as Record<string, unknown>,
    fromDb as Record<string, unknown>,
  ) as unknown as SiteContentV1;
}
