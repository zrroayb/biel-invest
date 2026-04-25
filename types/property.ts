export const PROPERTY_TYPES = [
  "villa",
  "arsa",
  "daire",
  "rezidans",
  "yazlik",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = [
  "satilik",
  "kiralik",
  "rezerve",
  "satildi",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const PROPERTY_REGIONS = [
  "yalikavak",
  "turkbuku",
  "gumusluk",
  "golturkbuku",
  "yali",
  "bodrumMerkez",
  "gundogan",
  "torba",
] as const;
/** Ids for defaults / seed; runtime list comes from `config/property_taxonomy` in Firestore. */
export type PropertyRegion = string;

export const PROPERTY_FEATURES = [
  "sea_view",
  "pool",
  "private_beach",
  "smart_home",
  "garden",
  "parking",
  "jacuzzi",
  "gym",
  "sauna",
  "fireplace",
  "security",
  "furnished",
  "elevator",
  "air_conditioning",
] as const;
export type PropertyFeature = string;

export const LOCALES = ["tr", "en", "de", "ru"] as const;
export type LocaleKey = (typeof LOCALES)[number];

export interface PropertySpecs {
  areaGross?: number | null;
  areaNet?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  yearBuilt?: number | null;
  plotSize?: number | null;
}

export interface PropertyTranslation {
  title: string;
  description: string;
  highlights: string[];
}

export type PropertyTranslations = Record<LocaleKey, PropertyTranslation>;

export interface PropertyMedia {
  cover: string | null;
  gallery: string[];
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
}

export interface PropertyCoordinates {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  slug: string;
  type: PropertyType;
  status: PropertyStatus;
  region: PropertyRegion;
  price: number;
  currency: "EUR" | "USD" | "TRY" | "GBP";
  specs: PropertySpecs;
  features: PropertyFeature[];
  translations: PropertyTranslations;
  media: PropertyMedia;
  coordinates?: PropertyCoordinates | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PropertyInput = Omit<Property, "id" | "createdAt" | "updatedAt">;

export function emptyTranslation(): PropertyTranslation {
  return { title: "", description: "", highlights: [] };
}

export function emptyTranslations(): PropertyTranslations {
  return {
    tr: emptyTranslation(),
    en: emptyTranslation(),
    de: emptyTranslation(),
    ru: emptyTranslation(),
  };
}

export function emptyPropertyInput(): PropertyInput {
  return {
    slug: "",
    type: "villa",
    status: "satilik",
    region: "yalikavak",
    price: 0,
    currency: "EUR",
    specs: {},
    features: [],
    translations: emptyTranslations(),
    media: { cover: null, gallery: [] },
    coordinates: null,
    featured: false,
  };
}
