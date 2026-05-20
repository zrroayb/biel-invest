import "server-only";

import { unstable_cache } from "next/cache";
import { useNextDataCache } from "@/lib/cache-policy";
import { siteContentToPerLocaleOverrides } from "@/lib/site-content/to-message-overrides";
import { getMergedSiteContent } from "@/lib/firestore/site-content";
import { PUBLIC_MESSAGES_CACHE_TAG } from "@/lib/cache-tags";
import type { LocaleKey } from "@/types/property";

const fetchOverrides = async () => {
  const merged = await getMergedSiteContent();
  return siteContentToPerLocaleOverrides(merged);
};

const getCachedOverrides = unstable_cache(
  fetchOverrides,
  [PUBLIC_MESSAGES_CACHE_TAG, "site-to-i18n", "v1"],
  { revalidate: 60, tags: [PUBLIC_MESSAGES_CACHE_TAG] },
);

export async function getSiteContentOverridesAll(): Promise<
  Record<LocaleKey, Record<string, unknown>>
> {
  if (!useNextDataCache()) return fetchOverrides();
  return getCachedOverrides();
}
