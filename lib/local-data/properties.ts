import "server-only";
/**
 * Firebase yapılandırılmadığında ilanları repo'daki data/properties.local.json'dan
 * okuyan yerel veri kaynağı. Görseller public/properties/... altından servis edilir.
 */
import type { Property } from "@/types/property";
import type { ListPropertiesParams } from "@/lib/firestore/properties";
import { areaForRegion } from "@/lib/property-taxonomy/region-areas";
import LOCAL from "@/data/properties.local.json";

const ALL = LOCAL as unknown as Property[];

export function listLocalProperties(params: ListPropertiesParams = {}): Property[] {
  let items = [...ALL];

  if (params.status) items = items.filter((p) => p.status === params.status);
  if (params.type) items = items.filter((p) => p.type === params.type);
  if (params.region) items = items.filter((p) => p.region === params.region);
  if (params.area)
    items = items.filter((p) => areaForRegion(p.region) === params.area);
  if (params.featured) items = items.filter((p) => p.featured);
  if (params.priceMin != null)
    items = items.filter((p) => p.price >= params.priceMin!);
  if (params.priceMax != null)
    items = items.filter((p) => p.price <= params.priceMax!);
  if (params.bedrooms != null)
    items = items.filter(
      (p) => (p.specs.bedrooms ?? 0) >= (params.bedrooms ?? 0),
    );
  if (params.features && params.features.length > 0)
    items = items.filter((p) =>
      params.features!.every((f) => p.features.includes(f)),
    );

  if (params.sort === "priceAsc")
    items = [...items].sort((a, b) => a.price - b.price);
  else if (params.sort === "priceDesc")
    items = [...items].sort((a, b) => b.price - a.price);
  else
    items = [...items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return items.slice(0, params.limit ?? 120);
}

export function getLocalPropertyBySlug(slug: string): Property | null {
  return ALL.find((p) => p.slug === slug) ?? null;
}

export function getLocalPropertyById(id: string): Property | null {
  return ALL.find((p) => p.id === id) ?? null;
}
