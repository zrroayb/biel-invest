import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { listProperties } from "@/lib/firestore/properties";
import { listInquiries } from "@/lib/firestore/inquiries";
import { listSiteAnalyticsEvents } from "@/lib/firestore/site-analytics";
import { aggregateVisitorBehaviorDashboard } from "@/lib/analytics/visitor-behavior-aggregate";
import {
  ArrowRight,
  Eye,
  Heart,
  HeartCrack,
  Home,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

function shortVisitor(id: string) {
  if (id.length <= 10) return id;
  return `${id.slice(0, 8)}…`;
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.behavior");
  const td = await getTranslations("admin.dashboard");

  let rawEvents: Awaited<ReturnType<typeof listSiteAnalyticsEvents>> = [];
  try {
    rawEvents = await listSiteAnalyticsEvents(5000);
  } catch {
    rawEvents = [];
  }

  const behavior = aggregateVisitorBehaviorDashboard(rawEvents, {
    windowDays: 7,
    recentLimit: 80,
    locale,
  });

  let totalProperties = 0;
  let activeProperties = 0;
  let totalInquiries = 0;
  let newInquiries = 0;
  try {
    const properties = await listProperties({ limit: 1000 });
    totalProperties = properties.length;
    activeProperties = properties.filter(
      (p) => p.status === "satilik" || p.status === "kiralik",
    ).length;
  } catch {}
  try {
    const inquiries = await listInquiries();
    totalInquiries = inquiries.length;
    newInquiries = inquiries.filter((i) => i.status === "new").length;
  } catch {}

  const maxDayViews = Math.max(1, ...behavior.viewsByDay.map((d) => d.count));

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          {t("subtitle", { days: behavior.windowDays })}
        </p>
      </header>

      {/* KPI */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {t("sectionKpi")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xs border border-ivory-300 bg-ivory-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-ink-muted">
              <Users className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.12em]">
                {t("kpiUniqueVisitors")}
              </span>
            </div>
            <p className="mt-4 font-display text-4xl tabular-nums text-ink">
              {behavior.uniqueVisitors}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{t("kpiUniqueHint")}</p>
          </div>
          <div className="rounded-xs border border-ivory-300 bg-ivory-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-ink-muted">
              <Eye className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.12em]">
                {t("kpiPageViews")}
              </span>
            </div>
            <p className="mt-4 font-display text-4xl tabular-nums text-ink">
              {behavior.pageViews}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{t("kpiPageViewsHint")}</p>
          </div>
          <div className="rounded-xs border border-ivory-300 bg-ivory-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-ink-muted">
              <Heart className="h-4 w-4 text-olive" />
              <span className="text-xs uppercase tracking-[0.12em]">
                {t("kpiFavoriteAdds")}
              </span>
            </div>
            <p className="mt-4 font-display text-4xl tabular-nums text-ink">
              {behavior.favoriteAdds}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {t("kpiFavoriteAddsHint")}
            </p>
          </div>
          <div className="rounded-xs border border-ivory-300 bg-ivory-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-ink-muted">
              <HeartCrack className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.12em]">
                {t("kpiFavoriteRemoves")}
              </span>
            </div>
            <p className="mt-4 font-display text-4xl tabular-nums text-ink">
              {behavior.favoriteRemoves}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {t("kpiFavoriteRemovesHint")}
            </p>
          </div>
        </div>
      </section>

      {/* Trend + tables */}
      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("sectionTrend")}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{t("sectionTrendHint")}</p>
          <div className="mt-4 flex h-44 items-end gap-1.5 rounded-xs border border-ivory-300 bg-white px-3 pb-1 pt-3">
            {behavior.viewsByDay.map((d) => {
              const barPx =
                d.count === 0
                  ? 2
                  : Math.max(8, Math.round((d.count / maxDayViews) * 120));
              return (
                <div
                  key={d.dayKey}
                  className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-[44px] rounded-t-sm bg-gradient-to-t from-olive to-olive/75 transition-opacity hover:opacity-90"
                    style={{ height: barPx }}
                    title={`${d.label}: ${d.count}`}
                  />
                  <span className="line-clamp-2 min-h-[2rem] max-w-full text-center text-[10px] leading-tight text-ink-muted">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("sectionTopPages")}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{t("sectionTopPagesHint")}</p>
          <div className="mt-4 overflow-hidden rounded-xs border border-ivory-300 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-200/50 text-[11px] uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">{t("colPath")}</th>
                  <th className="px-3 py-2 text-right font-semibold">
                    {t("colCount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {behavior.topPaths.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-8 text-center text-ink-muted"
                    >
                      {t("emptyRank")}
                    </td>
                  </tr>
                ) : (
                  behavior.topPaths.map((row, i) => (
                    <tr key={row.path} className="border-t border-ivory-200">
                      <td className="px-3 py-2 tabular-nums text-ink-muted">
                        {i + 1}
                      </td>
                      <td
                        className="max-w-[240px] truncate px-3 py-2 font-mono text-xs text-ink"
                        title={row.path}
                      >
                        {row.path}
                      </td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-ink">
                        {row.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {t("sectionTopFavorites")}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {t("sectionTopFavoritesHint")}
        </p>
        <div className="mt-4 overflow-hidden rounded-xs border border-ivory-300 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-200/50 text-[11px] uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">{t("colProperty")}</th>
                <th className="px-3 py-2 text-right font-semibold">
                  {t("colFavoriteClicks")}
                </th>
              </tr>
            </thead>
            <tbody>
              {behavior.topFavoriteProperties.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-ink-muted"
                  >
                    {t("emptyFavorites")}
                  </td>
                </tr>
              ) : (
                behavior.topFavoriteProperties.map((row, i) => (
                  <tr key={row.propertyId} className="border-t border-ivory-200">
                    <td className="px-3 py-2 tabular-nums text-ink-muted">
                      {i + 1}
                    </td>
                    <td
                      className="max-w-[320px] truncate px-3 py-2 text-ink"
                      title={row.label}
                    >
                      {row.label}
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums text-ink">
                      {row.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {t("sectionRecent")}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t("sectionRecentHint")}</p>
        <div className="mt-4 overflow-x-auto rounded-xs border border-ivory-300 bg-ivory">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ivory-300 bg-ivory-200/60 text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                <th className="px-3 py-3 font-semibold">{t("colTime")}</th>
                <th className="px-3 py-3 font-semibold">{t("colEvent")}</th>
                <th className="px-3 py-3 font-semibold">{t("colPath")}</th>
                <th className="px-3 py-3 font-semibold">{t("colDetail")}</th>
                <th className="px-3 py-3 font-semibold">{t("colVisitor")}</th>
                <th className="px-3 py-3 font-semibold">{t("colIp")}</th>
              </tr>
            </thead>
            <tbody>
              {behavior.recentEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-12 text-center text-ink-muted"
                  >
                    {t("emptyRecent")}
                  </td>
                </tr>
              ) : (
                behavior.recentEvents.map((row) => {
                  const detail =
                    row.propertyLabel ||
                    row.propertyId ||
                    (row.type !== "page_view" ? row.propertyId : null) ||
                    "—";
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-ivory-200 last:border-0"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-ink">
                        {row.createdAt.toLocaleString(locale, {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <span
                          className={
                            row.type === "favorite_add"
                              ? "rounded-xs bg-olive/15 px-2 py-0.5 text-xs font-medium text-olive"
                              : row.type === "favorite_remove"
                                ? "rounded-xs bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink-muted"
                                : "rounded-xs bg-ivory-300/80 px-2 py-0.5 text-xs font-medium text-ink"
                          }
                        >
                          {t(`action.${row.type}`)}
                        </span>
                        {row.locale ? (
                          <span className="ml-1 text-[10px] uppercase text-ink-muted">
                            {row.locale}
                          </span>
                        ) : null}
                      </td>
                      <td
                        className="max-w-[200px] truncate px-3 py-2.5 font-mono text-xs text-ink-muted"
                        title={row.path ?? undefined}
                      >
                        {row.path ?? "—"}
                      </td>
                      <td
                        className="max-w-[200px] truncate px-3 py-2.5 text-ink"
                        title={detail !== "—" ? detail : undefined}
                      >
                        {detail}
                      </td>
                      <td
                        className="max-w-[90px] truncate px-3 py-2.5 font-mono text-xs text-ink-muted"
                        title={row.visitorId}
                      >
                        {shortVisitor(row.visitorId)}
                      </td>
                      <td
                        className="max-w-[100px] truncate px-3 py-2.5 font-mono text-xs text-ink-muted"
                        title={
                          [row.ip, row.userAgent].filter(Boolean).join(" · ") ||
                          undefined
                        }
                      >
                        {row.ip ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ops strip */}
      <section className="rounded-xs border border-dashed border-ivory-300 bg-ivory-50/80 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {t("opsTitle")}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t("opsSubtitle")}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/properties"
            className="group flex items-center justify-between rounded-xs border border-ivory-300 bg-white px-4 py-3 text-sm transition-colors hover:border-ink"
          >
            <span className="flex items-center gap-2 text-ink">
              <Home className="h-4 w-4 text-ink-muted" />
              {td("totalProperties")}
            </span>
            <span className="flex items-center gap-2 font-display text-xl tabular-nums text-ink">
              {totalProperties}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </Link>
          <Link
            href="/admin/properties"
            className="group flex items-center justify-between rounded-xs border border-ivory-300 bg-white px-4 py-3 text-sm transition-colors hover:border-ink"
          >
            <span className="flex items-center gap-2 text-ink">
              <Sparkles className="h-4 w-4 text-ink-muted" />
              {td("activeProperties")}
            </span>
            <span className="flex items-center gap-2 font-display text-xl tabular-nums text-ink">
              {activeProperties}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </Link>
          <Link
            href="/admin/inquiries"
            className="group flex items-center justify-between rounded-xs border border-ivory-300 bg-white px-4 py-3 text-sm transition-colors hover:border-ink"
          >
            <span className="flex items-center gap-2 text-ink">
              <MessageSquare className="h-4 w-4 text-ink-muted" />
              {td("inquiries")}
            </span>
            <span className="flex items-center gap-2 font-display text-xl tabular-nums text-ink">
              {totalInquiries}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </Link>
          <Link
            href="/admin/inquiries?status=new"
            className="group flex items-center justify-between rounded-xs border border-ivory-300 bg-white px-4 py-3 text-sm transition-colors hover:border-ink"
          >
            <span className="flex items-center gap-2 text-ink">
              <MessageSquare className="h-4 w-4 text-ink-muted" />
              {td("newInquiries")}
            </span>
            <span className="flex items-center gap-2 font-display text-xl tabular-nums text-ink">
              {newInquiries}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
