import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listProperties } from "@/lib/firestore/properties";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminPropertiesPage() {
  const t = await getTranslations("admin.properties");
  const tStatus = await getTranslations("property.status");
  const tType = await getTranslations("property.type");

  let items: Awaited<ReturnType<typeof listProperties>> = [];
  try {
    items = await listProperties({ limit: 500 });
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
        <Link href="/admin/properties/new" className="btn btn-primary">
          <Plus className="h-4 w-4" /> {t("new")}
        </Link>
      </div>

      <div className="mt-10 overflow-hidden rounded-xs border border-ivory-300 bg-ivory-50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ivory-300 text-left text-xs uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-5 py-4">Başlık</th>
              <th className="px-5 py-4">Tip</th>
              <th className="px-5 py-4">Durum</th>
              <th className="px-5 py-4">Fiyat</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-16 text-center text-sm text-ink-muted"
                >
                  Henüz varlık yok.
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ivory-300 text-sm last:border-b-0 hover:bg-ivory-100"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">
                    {p.translations.tr.title || p.slug}
                  </div>
                  <div className="text-xs text-ink-muted">/{p.slug}</div>
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {tType(p.type)}
                </td>
                <td className="px-5 py-4">
                  <span className="chip">{tStatus(p.status)}</span>
                </td>
                <td className="px-5 py-4 font-display text-base text-ink">
                  {formatPrice(p.price, p.currency)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/properties/${p.id}/edit`}
                    className="link-underline text-xs"
                  >
                    {t("edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
