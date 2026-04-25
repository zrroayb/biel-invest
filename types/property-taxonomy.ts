import type { LocaleKey } from "./property";
import type { L10n } from "./site-content";

export type PropertyTaxonomyV1 = {
  version: 1;
  /** Display order: home regions grid, filters, property form */
  regions: Array<{
    id: string;
    labels: L10n;
    /** Optional home-page tile image; falls back to a generic image */
    imageUrl?: string;
  }>;
  features: Array<{
    id: string;
    labels: L10n;
  }>;
  updatedAt?: string;
};

export const REGION_ID_RE = /^[a-z][a-z0-9_]{0,63}$/;
export const FEATURE_ID_RE = /^[a-z][a-z0-9_]{0,63}$/;

export function labelOrFallback(
  labels: L10n,
  locale: string,
  id: string,
): string {
  const loc = locale as LocaleKey;
  return (
    labels[loc]?.trim() ||
    labels.tr?.trim() ||
    labels.en?.trim() ||
    id
  );
}
