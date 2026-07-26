/**
 * Bölge (region) -> üst düzey alan (area = şehir/ülke) eşlemesi.
 * Ana sayfada bölgeler alanlara göre gruplanır; böylece site yalnızca
 * "Bodrum" gibi görünmez, İstanbul ve Kuzey Kıbrıs da öne çıkar.
 */
import DATA from "@/data/region_areas.json";
import type { LocaleKey } from "@/types/property";

export type AreaL10n = Partial<Record<LocaleKey, string>>;
export type Area = { id: string; labels: AreaL10n };

const AREAS = DATA.areas as Area[];
const REGION_TO_AREA = DATA.regionToArea as Record<string, string>;

export function listAreas(): Area[] {
  return AREAS;
}

export function areaForRegion(regionId: string): string | null {
  return REGION_TO_AREA[regionId] ?? null;
}

export function regionsForArea(areaId: string): string[] {
  return Object.entries(REGION_TO_AREA)
    .filter(([, a]) => a === areaId)
    .map(([r]) => r);
}

export function areaLabel(area: Area, locale: string): string {
  const l = locale as LocaleKey;
  return area.labels[l] || area.labels.tr || area.id;
}
