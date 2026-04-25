import { getMergedPropertyTaxonomy, getRegionAndFeatureIdLists } from "@/lib/firestore/property-taxonomy";
import { PropertyForm } from "../_components/property-form";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  const tax = await getMergedPropertyTaxonomy();
  const { regionIds, featureIds } = getRegionAndFeatureIdLists(tax);
  return (
    <PropertyForm regionIds={regionIds} featureIds={featureIds} />
  );
}
