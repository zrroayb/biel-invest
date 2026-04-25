import "server-only";

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { deepMerge } from "@/lib/merge-messages";
import { loadMessageFileForLocale } from "@/lib/messages/public-defaults";
import { adminDb } from "@/lib/firebase/admin";
import { getSiteContentOverridesAll } from "@/lib/firestore/site-content-helpers";
import { getTaxonomyMessageLayerForLocale } from "@/lib/property-taxonomy/merge-into-messages";
import { PUBLIC_MESSAGES_CACHE_TAG } from "@/lib/cache-tags";
import { LOCALES } from "@/types/property";

const DOC_PATH = "config/public_site_copy" as const;

type LocaleKeyStr = (typeof LOCALES)[number];

export type PublicSiteCopyDocument = {
  tr?: Record<string, unknown>;
  en?: Record<string, unknown>;
  de?: Record<string, unknown>;
  ru?: Record<string, unknown>;
  updatedAt?: Timestamp;
};

function docRef() {
  return adminDb.doc(DOC_PATH);
}

export async function getPublicSiteCopyRaw(): Promise<PublicSiteCopyDocument> {
  const snap = await docRef().get();
  if (!snap.exists) return {};
  return (snap.data() as PublicSiteCopyDocument) ?? {};
}

const fetchMergedForLocale = async (locale: string) => {
  try {
    const base = await loadMessageFileForLocale(locale);
    const fromSite = (await getSiteContentOverridesAll())[
      locale as LocaleKeyStr
    ] as Record<string, unknown> | undefined;
    const raw = await getPublicSiteCopyRaw();
    const fromLegacy = raw[locale as LocaleKeyStr];
    const merged = deepMerge(
      deepMerge(base, fromSite ?? {}),
      fromLegacy ?? {},
    ) as Record<string, unknown>;
    const tax = (await getTaxonomyMessageLayerForLocale(locale)) as {
      regions: Record<string, string>;
      property: { feature: Record<string, string> };
    };
    const prop = (merged.property as Record<string, unknown>) ?? {};
    return {
      ...merged,
      regions: tax.regions,
      property: { ...prop, feature: tax.property.feature },
    } as Record<string, unknown>;
  } catch (err) {
    console.error("[i18n merge] failed, using file defaults only", err);
    return loadMessageFileForLocale(locale);
  }
};

const fetchMergedForLocaleWithCache = unstable_cache(
  async (locale: string) => fetchMergedForLocale(locale),
  [PUBLIC_MESSAGES_CACHE_TAG, "locale", "v3-taxonomy"],
  { revalidate: 60, tags: [PUBLIC_MESSAGES_CACHE_TAG] },
);

/**
 * Merged `messages` for next-intl (file + structured `site_content` + legacy
 * `public_site_copy`). Use `revalidateTag(PUBLIC_MESSAGES_CACHE_TAG)`.
 */
export function getMergedMessagesForLocaleCached(locale: string) {
  return fetchMergedForLocaleWithCache(locale);
}

export async function savePublicSiteCopy(
  data: PublicSiteCopyDocument,
): Promise<void> {
  await docRef().set(
    {
      tr: data.tr,
      en: data.en,
      de: data.de,
      ru: data.ru,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  revalidateTag(PUBLIC_MESSAGES_CACHE_TAG);
}

