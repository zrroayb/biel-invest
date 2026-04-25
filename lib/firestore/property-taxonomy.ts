import "server-only";

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { buildDefaultPropertyTaxonomy } from "@/lib/property-taxonomy/defaults";
import { PUBLIC_MESSAGES_CACHE_TAG } from "@/lib/cache-tags";
import {
  FEATURE_ID_RE,
  REGION_ID_RE,
  type PropertyTaxonomyV1,
} from "@/types/property-taxonomy";

const DOC_PATH = "config/property_taxonomy" as const;

const l10nSchema = z
  .object({
    tr: z.string().optional(),
    en: z.string().optional(),
    de: z.string().optional(),
    ru: z.string().optional(),
  })
  .partial();

const regionRowSchema = z.object({
  id: z.string().regex(REGION_ID_RE),
  labels: l10nSchema,
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

const featureRowSchema = z.object({
  id: z.string().regex(FEATURE_ID_RE),
  labels: l10nSchema,
});

const taxonomyPutSchema = z.object({
  version: z.literal(1),
  regions: z.array(regionRowSchema).min(1, "En az bir bölge gerekir"),
  features: z.array(featureRowSchema).min(1, "En az bir özellik gerekir"),
});

function toIso(v: unknown): string | null {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return null;
}

function docToTaxonomy(
  data: FirebaseFirestore.DocumentData,
): PropertyTaxonomyV1 | null {
  const raw = { version: data.version, regions: data.regions, features: data.features };
  const p = taxonomyPutSchema.safeParse(raw);
  if (!p.success) return null;
  return { ...p.data, updatedAt: toIso(data.updatedAt) ?? undefined };
}

const fetchMergedTaxonomy = async (): Promise<PropertyTaxonomyV1> => {
  const snap = await adminDb.doc(DOC_PATH).get();
  const fallback = await buildDefaultPropertyTaxonomy();
  if (!snap.exists) return fallback;
  const parsed = docToTaxonomy(snap.data()!);
  if (!parsed) return fallback;
  return parsed;
};

export const getMergedPropertyTaxonomy = unstable_cache(
  async () => fetchMergedTaxonomy(),
  [PUBLIC_MESSAGES_CACHE_TAG, "property-taxonomy", "v1"],
  { revalidate: 60, tags: [PUBLIC_MESSAGES_CACHE_TAG] },
);

export function getRegionAndFeatureIdLists(
  tax: PropertyTaxonomyV1,
): { regionIds: string[]; featureIds: string[] } {
  return {
    regionIds: tax.regions.map((r) => r.id),
    featureIds: tax.features.map((f) => f.id),
  };
}

export async function getPropertyTaxonomyForEditor(): Promise<{
  taxonomy: PropertyTaxonomyV1;
  updatedAt: string | null;
}> {
  const snap = await adminDb.doc(DOC_PATH).get();
  if (!snap.exists) {
    const def = await buildDefaultPropertyTaxonomy();
    return { taxonomy: def, updatedAt: null };
  }
  const data = snap.data()!;
  const parsed = docToTaxonomy(data);
  if (parsed) {
    return { taxonomy: parsed, updatedAt: toIso(data.updatedAt) };
  }
  const def = await buildDefaultPropertyTaxonomy();
  return { taxonomy: def, updatedAt: null };
}

export async function savePropertyTaxonomy(
  body: PropertyTaxonomyV1,
): Promise<void> {
  const parsed = taxonomyPutSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  for (const r of parsed.data.regions) {
    if (!r.labels.tr?.trim()) {
      throw new Error("Her bölge için Türkçe (tr) etiket gerekir.");
    }
  }
  for (const f of parsed.data.features) {
    if (!f.labels.tr?.trim()) {
      throw new Error("Her özellik için Türkçe (tr) etiket gerekir.");
    }
  }
  const cleaned: PropertyTaxonomyV1 = {
    version: 1,
    regions: parsed.data.regions.map((r) => ({
      id: r.id,
      labels: { ...r.labels } as PropertyTaxonomyV1["regions"][0]["labels"],
      imageUrl: r.imageUrl && r.imageUrl !== "" ? r.imageUrl : undefined,
    })),
    features: parsed.data.features.map((f) => ({
      id: f.id,
      labels: { ...f.labels } as PropertyTaxonomyV1["features"][0]["labels"],
    })),
  };
  await adminDb.doc(DOC_PATH).set(
    {
      ...cleaned,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: false },
  );
  revalidateTag(PUBLIC_MESSAGES_CACHE_TAG);
}
