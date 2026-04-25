import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPropertyTaxonomyForEditor } from "@/lib/firestore/property-taxonomy";
import { PropertyTaxonomyForm } from "./_components/property-taxonomy-form";

export const dynamic = "force-dynamic";

export default async function AdminPropertyTaxonomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.taxonomy");
  const initial = await getPropertyTaxonomyForEditor();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <PropertyTaxonomyForm initial={initial} />
      </div>
    </div>
  );
}
