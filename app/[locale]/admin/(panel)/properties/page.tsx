import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listProperties } from "@/lib/firestore/properties";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminPropertiesPage() {
  const t = await getTranslations("admin.properties");
  const tStatus = await getTranslations("property.status");
  const tType = await getTranslations("property.type");
  const tPf = await getTranslations("portfolio.filters");

  let items: Awaited<ReturnType<typeof listProperties>> = [];
  try {
    items = await listProperties({ limit: 500 });
  } catch {}

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">
          {t("title")}
        </h1>
        <Link
          href="/admin/properties/new"
          className="btn btn-primary w-full min-h-11 sm:w-auto"
        >
          <Plus className="h-4 w-4" /> {t("new")}
        </Link>
      </div>

      {/* Mobile: cards */}
      <div className="mt-8 space-y-3 md:hidden">
        {items.length === 0 && (
          <div className="rounded-lg border border-ivory-300 bg-ivory-50 py-14 text-center text-sm text-ink-muted">
            {t("listEmpty")}
          </div>
        )}
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/admin/properties/${p.id}/edit`}
            className={cn(
              "block rounded-lg border border-ivory-300 bg-ivory-50 p-4 transition-colors active:bg-ivory-100",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-ink">
                  {p.translations.tr.title || p.slug}
                </div>
                <div className="mt-0.5 text-xs text-ink-muted">/{p.slug}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="chip text-[10px]">{tType(p.type)}</span>
                  <span className="chip text-[10px]">{tStatus(p.status)}</span>
                </div>
                <p className="mt-2 font-display text-lg text-ink">
                  {formatPrice(p.price, p.currency)}
                </p>
              </div>
              <ChevronRight
                className="mt-1 h-5 w-5 shrink-0 text-ink-muted"
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="mt-10 hidden overflow-hidden rounded-lg border border-ivory-300 bg-ivory-50 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ivory-300 text-xs uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-5 py-4">{t("fields.title")}</th>
                <th className="px-5 py-4">{tPf("type")}</th>
                <th className="px-5 py-4">{tPf("status")}</th>
                <th className="px-5 py-4">{t("colPrice")}</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center text-ink-muted"
                  >
                    {t("listEmpty")}
                  </td>
                </tr>
              )}
              {items.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ivory-300 last:border-b-0 hover:bg-ivory-100/80"
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
    </div>
  );
}
