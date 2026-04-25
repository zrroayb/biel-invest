import { LOCALES, type LocaleKey } from "@/types/property";
import type { L10n, SiteContentV1 } from "@/types/site-content";

function pick(b: L10n, loc: LocaleKey): string {
  return b[loc] ?? "";
}

export function siteContentToPerLocaleOverrides(
  sc: SiteContentV1,
): Record<LocaleKey, Record<string, unknown>> {
  const result = {} as Record<LocaleKey, Record<string, unknown>>;
  for (const loc of LOCALES) {
    result[loc] = {
      brand: {
        name: pick(sc.brand.name, loc),
        tagline: pick(sc.brand.tagline, loc),
        headerMotto: pick(sc.brand.headerMotto, loc),
      },
      nav: {
        home: pick(sc.nav.home, loc),
        portfolio: pick(sc.nav.portfolio, loc),
        about: pick(sc.nav.about, loc),
        contact: pick(sc.nav.contact, loc),
        favorites: pick(sc.nav.favorites, loc),
      },
      seo: {
        homeTitle: pick(sc.seo.homeTitle, loc),
        homeDescription: pick(sc.seo.homeDescription, loc),
        portfolioTitle: pick(sc.seo.portfolioTitle, loc),
        portfolioDescription: pick(sc.seo.portfolioDescription, loc),
        aboutTitle: pick(sc.seo.aboutTitle, loc),
        aboutDescription: pick(sc.seo.aboutDescription, loc),
        contactTitle: pick(sc.seo.contactTitle, loc),
        contactDescription: pick(sc.seo.contactDescription, loc),
        favoritesTitle: pick(sc.seo.favoritesTitle, loc),
        favoritesDescription: pick(sc.seo.favoritesDescription, loc),
      },
      home: {
        heroBackgroundUrl: sc.home.hero.backgroundUrl,
        heroImageAlt: pick(sc.home.hero.imageAlt, loc),
        heroEyebrow: pick(sc.home.hero.eyebrow, loc),
        heroTitle: pick(sc.home.hero.title, loc),
        heroSubtitle: pick(sc.home.hero.subtitle, loc),
        heroCtaPortfolio: pick(sc.home.hero.ctaPortfolio, loc),
        heroCtaContact: pick(sc.home.hero.ctaContact, loc),
        heroDecorLine: pick(sc.home.hero.decorLine, loc),
        featuredTitle: pick(sc.home.featured.title, loc),
        featuredSubtitle: pick(sc.home.featured.subtitle, loc),
        seeAll: pick(sc.home.featured.seeAll, loc),
        regionsTitle: pick(sc.home.regions.title, loc),
        regionsSubtitle: pick(sc.home.regions.subtitle, loc),
        aboutTitle: pick(sc.home.aboutSnippet.title, loc),
        aboutBody: pick(sc.home.aboutSnippet.body, loc),
        aboutCta: pick(sc.home.aboutSnippet.cta, loc),
      },
      about: {
        heroEyebrow: pick(sc.aboutPage.heroEyebrow, loc),
        sideImageUrl: sc.aboutPage.sideImageUrl,
        sideImageAlt: pick(sc.aboutPage.sideImageAlt, loc),
        title: pick(sc.aboutPage.title, loc),
        subtitle: pick(sc.aboutPage.subtitle, loc),
        body: pick(sc.aboutPage.body, loc),
        statYears: sc.aboutPage.statYears,
        statAssets: sc.aboutPage.statAssets,
        statLangs: sc.aboutPage.statLangs,
        statYearsLabel: pick(sc.aboutPage.statYearsLabel, loc),
        statAssetsLabel: pick(sc.aboutPage.statAssetsLabel, loc),
        statLangsLabel: pick(sc.aboutPage.statLangsLabel, loc),
      },
      contact: {
        heroEyebrow: pick(sc.contactPage.heroEyebrow, loc),
        title: pick(sc.contactPage.title, loc),
        subtitle: pick(sc.contactPage.subtitle, loc),
        addressLine: pick(sc.contactPage.addressLine, loc),
        form: { title: pick(sc.contactPage.formTitle, loc) },
        office: undefined,
        phone: undefined,
        email: undefined,
      },
      favorites: {
        title: pick(sc.favoritesPage.title, loc),
        subtitle: pick(sc.favoritesPage.subtitle, loc),
        empty: pick(sc.favoritesPage.empty, loc),
        browsePortfolio: pick(sc.favoritesPage.browsePortfolio, loc),
      },
      portfolio: {
        title: pick(sc.portfolioPage.title, loc),
        subtitle: pick(sc.portfolioPage.subtitle, loc),
        empty: pick(sc.portfolioPage.empty, loc),
        displayCurrency: pick(sc.portfolioPage.displayCurrency, loc),
      },
      footer: {
        locationLine: pick(sc.footer.locationLine, loc),
        rights: pick(sc.footer.rights, loc),
        quickLinks: pick(sc.footer.quickLinks, loc),
      },
    };
  }
  return result;
}
