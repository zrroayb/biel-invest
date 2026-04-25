import "server-only";

import { loadMessageFileForLocale } from "@/lib/messages/public-defaults";
import {
  LOCALES,
  PROPERTY_FEATURES,
  PROPERTY_REGIONS,
  type LocaleKey,
} from "@/types/property";
import type { PropertyTaxonomyV1 } from "@/types/property-taxonomy";
import { BUILTIN_REGION_TILE_IMAGES } from "./region-fallback-images";

type MsgRegions = Record<string, string>;
type MsgFeatures = Record<string, string>;

function getRegionsObject(m: Record<string, unknown>): MsgRegions {
  const r = m.regions;
  if (r && typeof r === "object" && !Array.isArray(r)) {
    return r as MsgRegions;
  }
  return {};
}

function getFeaturesObject(m: Record<string, unknown>): MsgFeatures {
  const p = m.property;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const f = (p as { feature?: unknown }).feature;
    if (f && typeof f === "object" && !Array.isArray(f)) {
      return f as MsgFeatures;
    }
  }
  return {};
}

/**
 * Initial taxonomy: region / feature order and labels from the JSON message files
 * (plus default tile images for known region ids).
 */
export async function buildDefaultPropertyTaxonomy(): Promise<PropertyTaxonomyV1> {
  const per: Record<LocaleKey, { regions: MsgRegions; features: MsgFeatures }> = {
    tr: { regions: {}, features: {} },
    en: { regions: {}, features: {} },
    de: { regions: {}, features: {} },
    ru: { regions: {}, features: {} },
  };
  for (const loc of LOCALES) {
    const m = await loadMessageFileForLocale(loc);
    per[loc] = { regions: getRegionsObject(m), features: getFeaturesObject(m) };
  }

  const regions: PropertyTaxonomyV1["regions"] = PROPERTY_REGIONS.map((id) => ({
    id,
    labels: {
      tr: per.tr.regions[id] ?? id,
      en: per.en.regions[id] ?? id,
      de: per.de.regions[id] ?? id,
      ru: per.ru.regions[id] ?? id,
    },
    imageUrl: BUILTIN_REGION_TILE_IMAGES[id],
  }));

  const features: PropertyTaxonomyV1["features"] = PROPERTY_FEATURES.map(
    (id) => ({
      id,
      labels: {
        tr: per.tr.features[id] ?? id,
        en: per.en.features[id] ?? id,
        de: per.de.features[id] ?? id,
        ru: per.ru.features[id] ?? id,
      },
    }),
  );

  return { version: 1, regions, features };
}
