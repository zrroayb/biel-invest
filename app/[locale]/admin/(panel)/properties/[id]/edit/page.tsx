import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/firestore/properties";
import {
  getMergedPropertyTaxonomy,
  getRegionAndFeatureIdLists,
} from "@/lib/firestore/property-taxonomy";
import { PropertyForm } from "../../_components/property-form";
import type { PropertyInput } from "@/types/property";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const tax = await getMergedPropertyTaxonomy();
  const { regionIds, featureIds } = getRegionAndFeatureIdLists(tax);

  const initial: PropertyInput = {
    slug: property.slug,
    type: property.type,
    status: property.status,
    region: property.region,
    price: property.price,
    currency: property.currency,
    specs: property.specs,
    features: property.features,
    translations: property.translations,
    media: property.media,
    coordinates: property.coordinates ?? null,
    featured: property.featured,
  };

  return (
    <PropertyForm
      id={id}
      initial={initial}
      regionIds={regionIds}
      featureIds={featureIds}
    />
  );
}
