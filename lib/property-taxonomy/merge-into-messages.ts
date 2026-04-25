import "server-only";

import { getMergedPropertyTaxonomy } from "@/lib/firestore/property-taxonomy";
import { labelOrFallback } from "@/types/property-taxonomy";

/**
 * Replaces the whole `regions` map and `property.feature` map so new CMS ids
 * win and removed ids disappear from the merged UI copy.
 */
export async function getTaxonomyMessageLayerForLocale(
  locale: string,
): Promise<Record<string, unknown>> {
  const tax = await getMergedPropertyTaxonomy();
  const regions: Record<string, string> = {};
  for (const r of tax.regions) {
    regions[r.id] = labelOrFallback(r.labels, locale, r.id);
  }
  const feature: Record<string, string> = {};
  for (const f of tax.features) {
    feature[f.id] = labelOrFallback(f.labels, locale, f.id);
  }
  return {
    regions,
    property: { feature },
  } as Record<string, unknown>;
}
