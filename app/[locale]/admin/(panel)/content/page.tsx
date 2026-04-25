import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteContentForEditor } from "@/lib/firestore/site-content";
import { SiteContentForm } from "./_components/site-content-form";

export const dynamic = "force-dynamic";

export default async function AdminSiteContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.content");
  const initial = await getSiteContentForEditor();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <SiteContentForm initial={initial} />
      </div>
    </div>
  );
}
