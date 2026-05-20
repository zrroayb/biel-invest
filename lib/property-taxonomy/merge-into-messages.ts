import "server-only";

import { buildDefaultPropertyTaxonomy } from "@/lib/property-taxonomy/defaults";
import { getMergedPropertyTaxonomy } from "@/lib/firestore/property-taxonomy";
import { labelOrFallback } from "@/types/property-taxonomy";
import type { PropertyTaxonomyV1 } from "@/types/property-taxonomy";

/**
 * Replaces the whole `regions` map and `property.feature` map so new CMS ids
 * win and removed ids disappear from the merged UI copy.
 */
function taxonomyToLayer(tax: PropertyTaxonomyV1, locale: string): Record<string, unknown> {
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

export async function getTaxonomyMessageLayerForLocale(
  locale: string,
): Promise<Record<string, unknown>> {
  try {
    const tax = await getMergedPropertyTaxonomy();
    return taxonomyToLayer(tax, locale);
  } catch (err) {
    console.error("[taxonomy layer] failed, using message defaults", err);
    const tax = await buildDefaultPropertyTaxonomy();
    return taxonomyToLayer(tax, locale);
  }
}
