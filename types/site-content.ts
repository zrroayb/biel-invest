import type { LocaleKey } from "./property";

/** Localized string bucket (per locale). */
export type L10n = Partial<Record<LocaleKey, string>>;

export type SiteContentV1 = {
  version: 1;
  home: {
    hero: {
      backgroundUrl: string;
      imageAlt: L10n;
      eyebrow: L10n;
      title: L10n;
      subtitle: L10n;
      ctaPortfolio: L10n;
      ctaContact: L10n;
      decorLine: L10n;
    };
    featured: {
      title: L10n;
      subtitle: L10n;
      seeAll: L10n;
    };
    regions: { title: L10n; subtitle: L10n };
    aboutSnippet: { title: L10n; body: L10n; cta: L10n };
  };
  aboutPage: {
    heroEyebrow: L10n;
    sideImageUrl: string;
    sideImageAlt: L10n;
    title: L10n;
    subtitle: L10n;
    body: L10n;
    statYears: string;
    statAssets: string;
    statLangs: string;
    statYearsLabel: L10n;
    statAssetsLabel: L10n;
    statLangsLabel: L10n;
  };
  contactPage: {
    heroEyebrow: L10n;
    title: L10n;
    subtitle: L10n;
    formTitle: L10n;
    addressLine: L10n;
  };
  favoritesPage: {
    title: L10n;
    subtitle: L10n;
    empty: L10n;
    browsePortfolio: L10n;
  };
  portfolioPage: {
    title: L10n;
    subtitle: L10n;
    empty: L10n;
    displayCurrency: L10n;
  };
  brand: { name: L10n; tagline: L10n; headerMotto: L10n };
  nav: {
    home: L10n;
    portfolio: L10n;
    about: L10n;
    contact: L10n;
    favorites: L10n;
  };
  footer: {
    locationLine: L10n;
    rights: L10n;
    quickLinks: L10n;
  };
  seo: {
    homeTitle: L10n;
    homeDescription: L10n;
    portfolioTitle: L10n;
    portfolioDescription: L10n;
    aboutTitle: L10n;
    aboutDescription: L10n;
    contactTitle: L10n;
    contactDescription: L10n;
    favoritesTitle: L10n;
    favoritesDescription: L10n;
  };
};
