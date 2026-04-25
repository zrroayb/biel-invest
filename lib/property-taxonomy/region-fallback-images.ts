import type { PropertyTaxonomyV1 } from "@/types/property-taxonomy";

/** Stock images for built-in region ids; new regions can set `imageUrl` on the taxonomy. */
export const BUILTIN_REGION_TILE_IMAGES: Record<string, string> = {
  yalikavak:
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  turkbuku:
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1200&q=80",
  gumusluk:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80",
  golturkbuku:
    "https://images.unsplash.com/photo-1537726235470-8504e3beef77?auto=format&fit=crop&w=1200&q=80",
  yali: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  bodrumMerkez:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  gundogan:
    "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=80",
  torba:
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
};

const GENERIC_BODRUM =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=export&w=1200&q=80";

export function regionTileImage(r: PropertyTaxonomyV1["regions"][0]): string {
  if (r.imageUrl?.trim()) return r.imageUrl.trim();
  return BUILTIN_REGION_TILE_IMAGES[r.id] ?? GENERIC_BODRUM;
}
