import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { VisitorBehaviorDashboard } from "@/lib/analytics/visitor-behavior-aggregate";
import type { SiteAnalyticsEventRow } from "@/lib/firestore/site-analytics";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Eye,
  Globe2,
  Heart,
  HeartCrack,
  Home,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const OLIVE = "#1F8FC7";
const OLIVE_DARK = "#16709F";
const IVORY_300 = "#E8E2D8";
const INK_MUTED = "#6B6762";

function shortVisitor(id: string) {
  if (id.length <= 10) return id;
  return `${id.slice(0, 8)}…`;
}

function eventGeoLabel(row: {
  city: string | null;
  region: string | null;
  country: string | null;
}): string | null {
  const parts = [row.city, row.region, row.country].filter(Boolean) as string[];
  return parts.length ? parts.join(" · ") : null;
}

function Sparkline({ values }: { values: number[] }) {
  const w = 140;
  const h = 40;
  const pad = 3;
  const max = Math.max(1, ...values);
  const n = values.length;
  const coords = values.map((v, i) => {
    const x = pad + (n <= 1 ? w / 2 : (i / (n - 1)) * (w - 2 * pad));
    const y = h - pad - (v / max) * (h - 2 * pad);
    return { x, y };
  });
  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 w-full max-w-[148px] text-olive/90"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon
        points={area}
        className="fill-olive/[0.08] stroke-none"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={line}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function EventMixDonut({
  pageViews,
  favoriteAdds,
  favoriteRemoves,
  legend,
}: {
  pageViews: number;
  favoriteAdds: number;
  favoriteRemoves: number;
  legend: { page: string; add: string; remove: string };
}) {
  const total = pageViews + favoriteAdds + favoriteRemoves;
  const safe = total > 0 ? total : 1;
  const d1 = (pageViews / safe) * 360;
  const d2 = (favoriteAdds / safe) * 360;
  const d3 = (favoriteRemoves / safe) * 360;
  const a1 = d1;
  const a2 = a1 + d2;
  const bg =
    total === 0
      ? `conic-gradient(${IVORY_300} 0deg 360deg)`
      : `conic-gradient(${OLIVE} 0deg ${a1}deg, ${OLIVE_DARK} ${a1}deg ${a2}deg, ${IVORY_300} ${a2}deg 360deg)`;

  const items = [
    { color: OLIVE, label: legend.page, value: pageViews },
    { color: OLIVE_DARK, label: legend.add, value: favoriteAdds },
    { color: INK_MUTED, label: legend.remove, value: favoriteRemoves },
  ];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
      <div className="relative h-36 w-36 shrink-0">
        <div
          className="absolute inset-0 rounded-full shadow-inner"
          style={{ background: bg }}
        />
        <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <span className="font-display text-2xl tabular-nums text-ink">
            {total}
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Σ
          </span>
        </div>
      </div>
      <ul className="min-w-[200px] space-y-3 text-sm">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-ink-muted">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: it.color }}
              />
              {it.label}
            </span>
            <span className="tabular-nums font-medium text-ink">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankBarList({
  title,
  hint,
  rows,
  valueLabel,
  empty,
  icon: Icon,
  formatLabel,
}: {
  title: string;
  hint: string;
  rows: { key: string; label: string; count: number }[];
  valueLabel: string;
  empty: string;
  icon: LucideIcon;
  formatLabel?: (label: string) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="flex h-full flex-col rounded-sm border border-ivory-300/80 bg-white p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-ivory-200/80 text-olive">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-tight text-ink">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p>
        </div>
      </div>
      <div className="mt-5 flex min-h-[200px] flex-1 flex-col gap-3">
        {rows.length === 0 ? (
          <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-ink-muted">
            {empty}
          </p>
        ) : (
          rows.map((row, i) => {
            const pct = Math.round((row.count / max) * 100);
            const shown = formatLabel ? formatLabel(row.label) : row.label;
            return (
              <div key={row.key} className="group">
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate font-medium text-ink">
                    <span className="mr-1.5 tabular-nums text-ink-muted">
                      {i + 1}.
                    </span>
                    <span title={shown}>{shown}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    {row.count}{" "}
                    <span className="hidden sm:inline">{valueLabel}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ivory-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-olive to-olive-light transition-[width] duration-500 group-hover:opacity-90"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RecentStrip({
  events,
  locale,
  labels,
}: {
  events: SiteAnalyticsEventRow[];
  locale: string;
  labels: {
    geoUnknown: string;
    action: Record<string, string>;
    colTime: string;
    colEvent: string;
    colPath: string;
    colDetail: string;
    colVisitor: string;
    colGeo: string;
    colIp: string;
    emptyRecent: string;
  };
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-ivory-300 bg-ivory-50/50 py-16 text-center text-sm text-ink-muted">
        {labels.emptyRecent}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-ivory-300/80 bg-white shadow-soft">
      <div className="max-h-[min(520px,55vh)] overflow-y-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-[1] border-b border-ivory-200 bg-ivory-50/95 backdrop-blur-sm">
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-4 py-3 pl-5">{labels.colTime}</th>
              <th className="px-4 py-3">{labels.colEvent}</th>
              <th className="px-4 py-3">{labels.colPath}</th>
              <th className="px-4 py-3">{labels.colDetail}</th>
              <th className="px-4 py-3">{labels.colVisitor}</th>
              <th className="px-4 py-3">{labels.colGeo}</th>
              <th className="px-4 py-3 pr-5">{labels.colIp}</th>
            </tr>
          </thead>
          <tbody>
            {events.map((row, idx) => {
              const detail =
                row.propertyLabel ||
                row.propertyId ||
                (row.type !== "page_view" ? row.propertyId : null) ||
                "—";
              const geo = eventGeoLabel(row);
              const tone =
                row.type === "favorite_add"
                  ? "bg-emerald-50/80"
                  : row.type === "favorite_remove"
                    ? "bg-ivory-100/80"
                    : idx % 2 === 0
                      ? "bg-white"
                      : "bg-ivory-50/40";
              return (
                <tr key={row.id} className={cn("border-b border-ivory-200/80", tone)}>
                  <td className="whitespace-nowrap px-4 py-2.5 pl-5 tabular-nums text-xs text-ink-muted">
                    {row.createdAt.toLocaleString(locale, {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        row.type === "favorite_add" &&
                          "bg-olive/15 text-olive-dark",
                        row.type === "favorite_remove" &&
                          "bg-ink/10 text-ink-muted",
                        row.type === "page_view" &&
                          "bg-ivory-200 text-ink-soft",
                      )}
                    >
                      {labels.action[row.type] ?? row.type}
                    </span>
                    {row.locale ? (
                      <span className="ml-1.5 text-[10px] font-medium uppercase text-ink-muted">
                        {row.locale}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className="max-w-[180px] truncate px-4 py-2.5 font-mono text-[11px] text-ink-muted"
                    title={row.path ?? undefined}
                  >
                    {row.path ?? "—"}
                  </td>
                  <td
                    className="max-w-[200px] truncate px-4 py-2.5 text-ink"
                    title={detail !== "—" ? detail : undefined}
                  >
                    {detail}
                  </td>
                  <td
                    className="max-w-[88px] truncate px-4 py-2.5 font-mono text-[11px] text-ink-muted"
                    title={row.visitorId}
                  >
                    {shortVisitor(row.visitorId)}
                  </td>
                  <td
                    className="max-w-[130px] truncate px-4 py-2.5 text-xs text-ink-muted"
                    title={geo ?? undefined}
                  >
                    {geo ?? labels.geoUnknown}
                  </td>
                  <td
                    className="max-w-[96px] truncate px-4 py-2.5 pr-5 font-mono text-[11px] text-ink-muted"
                    title={
                      [row.ip, row.userAgent].filter(Boolean).join(" · ") ||
                      undefined
                    }
                  >
                    {row.ip ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function BehaviorBiDashboard({
  behavior,
  locale,
  ops,
}: {
  behavior: VisitorBehaviorDashboard;
  locale: string;
  ops: {
    totalProperties: number;
    activeProperties: number;
    totalInquiries: number;
    newInquiries: number;
  };
}) {
  const t = await getTranslations("admin.behavior");
  const td = await getTranslations("admin.dashboard");

  const sparkValues = behavior.viewsByDay.map((d) => d.count);
  const maxDayViews = Math.max(1, ...sparkValues);
  const peakDay = behavior.viewsByDay.reduce(
    (best, d) => (d.count > best.count ? d : best),
    behavior.viewsByDay[0] ?? { dayKey: "", label: "", count: 0 },
  );
  const totalEvents =
    behavior.pageViews + behavior.favoriteAdds + behavior.favoriteRemoves;
  const avgViewsPerVisitor =
    behavior.uniqueVisitors > 0
      ? Math.round((behavior.pageViews / behavior.uniqueVisitors) * 10) / 10
      : 0;
  const engagementPct =
    behavior.pageViews > 0
      ? Math.round((behavior.favoriteAdds / behavior.pageViews) * 1000) / 10
      : 0;
  const favNet = behavior.favoriteAdds - behavior.favoriteRemoves;

  const topPathRows = behavior.topPaths.map((r) => ({
    key: r.path,
    label: r.path,
    count: r.count,
  }));
  const topGeoRows = behavior.topGeo.map((r, i) => ({
    key: `${r.country}-${r.region}-${r.city}-${i}`,
    label: r.label || t("geoUnknown"),
    count: r.count,
  }));
  const topFavRows = behavior.topFavoriteProperties.map((r) => ({
    key: r.propertyId,
    label: r.label,
    count: r.count,
  }));

  return (
    <div className="space-y-10 pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-sm border border-ivory-300 bg-gradient-to-br from-ink via-ink to-[#2a3a42] px-6 py-8 text-ivory shadow-lift sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-olive/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-olive-light/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/70">
              <BarChart3 className="h-4 w-4 text-olive-light" />
              {t("biEyebrow")}
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-tight text-ivory sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ivory/75">
              {t("subtitle", { days: behavior.windowDays })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-ivory">
              <Activity className="h-3.5 w-3.5 text-olive-light" />
              {t("biWindowPill", { days: behavior.windowDays })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-ivory">
              <Zap className="h-3.5 w-3.5 text-olive-light" />
              {t("biEventsLogged", { count: totalEvents })}
            </span>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-sm border border-ivory-300/90 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-olive/10 text-olive">
              <Users className="h-5 w-5" />
            </div>
            <TrendingUp className="h-4 w-4 text-ivory-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("kpiUniqueVisitors")}
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums tracking-tight text-ink">
            {behavior.uniqueVisitors}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {t("kpiUniqueHint")}
          </p>
          <p className="mt-3 border-t border-ivory-200 pt-3 text-xs text-ink-muted">
            <span className="font-medium text-ink">{avgViewsPerVisitor}</span>{" "}
            {t("kpiAvgViewsPerVisitorHint")}
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-sm border border-ivory-300/90 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-olive/10 text-olive">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("kpiPageViews")}
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums tracking-tight text-ink">
            {behavior.pageViews}
          </p>
          <Sparkline values={sparkValues} />
          <p className="mt-1 text-xs text-ink-muted">{t("kpiPageViewsHint")}</p>
        </div>

        <div className="group relative overflow-hidden rounded-sm border border-ivory-300/90 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-700">
            <Heart className="h-5 w-5" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("kpiFavoriteAdds")}
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums tracking-tight text-ink">
            {behavior.favoriteAdds}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            {t("kpiFavoriteAddsHint")}
          </p>
          <p className="mt-3 border-t border-ivory-200 pt-3 text-xs text-ink-muted">
            <span className="font-medium text-olive">{engagementPct}%</span>{" "}
            {t("kpiEngagementHint")}
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-sm border border-ivory-300/90 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-ink/5 text-ink-muted">
            <HeartCrack className="h-5 w-5" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("kpiFavoriteRemoves")}
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums tracking-tight text-ink">
            {behavior.favoriteRemoves}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            {t("kpiFavoriteRemovesHint")}
          </p>
          <p className="mt-3 border-t border-ivory-200 pt-3 text-xs text-ink-muted">
            <span
              className={cn(
                "font-medium",
                favNet >= 0 ? "text-emerald-700" : "text-ink-muted",
              )}
            >
              {favNet >= 0 ? "+" : ""}
              {favNet}
            </span>{" "}
            {t("kpiFavoritesNetHint")}
          </p>
        </div>
      </section>

      {/* Trend + mix */}
      <div className="grid gap-6 xl:grid-cols-12">
        <section className="xl:col-span-7">
          <div className="h-full rounded-sm border border-ivory-300/80 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-xl text-ink">
                  {t("sectionTrend")}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {t("sectionTrendHint")}
                </p>
              </div>
              <div className="rounded-sm bg-ivory-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t("biPeakDay")}
                </p>
                <p className="text-sm font-medium text-ink">
                  {peakDay.label}{" "}
                  <span className="tabular-nums text-olive">({peakDay.count})</span>
                </p>
              </div>
            </div>
            <div className="relative mt-6 h-52 rounded-sm border border-ivory-200/80 bg-gradient-to-b from-ivory-50/80 to-white px-2 pt-4">
              <div
                className="pointer-events-none absolute inset-x-4 top-4 bottom-10 flex flex-col justify-between"
                aria-hidden
              >
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-px w-full bg-ivory-200/60" />
                ))}
              </div>
              <div className="relative flex h-full items-end justify-between gap-1.5 px-2 pb-8">
                {behavior.viewsByDay.map((d) => {
                  const barPx =
                    d.count === 0
                      ? 3
                      : Math.max(
                          10,
                          Math.round((d.count / maxDayViews) * 140),
                        );
                  return (
                    <div
                      key={d.dayKey}
                      className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex w-full flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold tabular-nums text-ink/70">
                          {d.count}
                        </span>
                        <div
                          className="w-full max-w-[40px] rounded-t-sm bg-gradient-to-t from-olive-dark via-olive to-olive-light shadow-sm transition-transform hover:scale-[1.02]"
                          style={{ height: barPx }}
                          title={`${d.label}: ${d.count}`}
                        />
                      </div>
                      <span className="line-clamp-2 min-h-[2.25rem] max-w-full text-center text-[10px] font-medium leading-tight text-ink-muted">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="xl:col-span-5">
          <div className="flex h-full flex-col rounded-sm border border-ivory-300/80 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-xl text-ink">
                  {t("sectionEventMix")}
                </h2>
                <p className="text-sm text-ink-muted">{t("sectionEventMixHint")}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-1 items-center justify-center py-2">
              <EventMixDonut
                pageViews={behavior.pageViews}
                favoriteAdds={behavior.favoriteAdds}
                favoriteRemoves={behavior.favoriteRemoves}
                legend={{
                  page: t("legendPageViews"),
                  add: t("legendFavAdds"),
                  remove: t("legendFavRemoves"),
                }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Rank gadgets */}
      <section className="grid gap-6 lg:grid-cols-3">
        <RankBarList
          title={t("sectionTopPages")}
          hint={t("sectionTopPagesHint")}
          rows={topPathRows}
          valueLabel={t("colCount")}
          empty={t("emptyRank")}
          icon={BarChart3}
          formatLabel={(path) =>
            path.replace(/^\/[a-z]{2}(?=\/|$)/, "") || path
          }
        />
        <RankBarList
          title={t("sectionTopGeo")}
          hint={t("sectionTopGeoHint")}
          rows={topGeoRows}
          valueLabel={t("colPageViews")}
          empty={t("emptyGeo")}
          icon={Globe2}
        />
        <RankBarList
          title={t("sectionTopFavorites")}
          hint={t("sectionTopFavoritesHint")}
          rows={topFavRows}
          valueLabel={t("colFavoriteClicks")}
          empty={t("emptyFavorites")}
          icon={Heart}
        />
      </section>

      {/* Live feed */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-ivory">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-xl text-ink">{t("sectionRecent")}</h2>
              <p className="text-sm text-ink-muted">{t("sectionRecentHint")}</p>
            </div>
          </div>
        </div>
        <RecentStrip
          events={behavior.recentEvents}
          locale={locale}
          labels={{
            geoUnknown: t("geoUnknown"),
            action: {
              page_view: t("action.page_view"),
              favorite_add: t("action.favorite_add"),
              favorite_remove: t("action.favorite_remove"),
            },
            colTime: t("colTime"),
            colEvent: t("colEvent"),
            colPath: t("colPath"),
            colDetail: t("colDetail"),
            colVisitor: t("colVisitor"),
            colGeo: t("colGeo"),
            colIp: t("colIp"),
            emptyRecent: t("emptyRecent"),
          }}
        />
      </section>

      {/* Ops */}
      <section className="rounded-sm border border-ivory-300/80 bg-gradient-to-br from-ivory-50 to-white p-6 shadow-soft sm:p-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {t("opsTitle")}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t("opsSubtitle")}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/properties"
            className="group flex items-center justify-between rounded-sm border border-ivory-300 bg-white px-4 py-4 shadow-sm transition-all hover:border-olive/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3 text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ivory-200 text-ink-muted group-hover:bg-olive/10 group-hover:text-olive">
                <Home className="h-4 w-4" />
              </span>
              {td("totalProperties")}
            </span>
            <span className="flex items-center gap-2 font-display text-2xl tabular-nums text-ink">
              {ops.totalProperties}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
            </span>
          </Link>
          <Link
            href="/admin/properties"
            className="group flex items-center justify-between rounded-sm border border-ivory-300 bg-white px-4 py-4 shadow-sm transition-all hover:border-olive/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3 text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ivory-200 text-ink-muted group-hover:bg-olive/10 group-hover:text-olive">
                <Sparkles className="h-4 w-4" />
              </span>
              {td("activeProperties")}
            </span>
            <span className="flex items-center gap-2 font-display text-2xl tabular-nums text-ink">
              {ops.activeProperties}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
            </span>
          </Link>
          <Link
            href="/admin/inquiries"
            className="group flex items-center justify-between rounded-sm border border-ivory-300 bg-white px-4 py-4 shadow-sm transition-all hover:border-olive/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3 text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ivory-200 text-ink-muted group-hover:bg-olive/10 group-hover:text-olive">
                <MessageSquare className="h-4 w-4" />
              </span>
              {td("inquiries")}
            </span>
            <span className="flex items-center gap-2 font-display text-2xl tabular-nums text-ink">
              {ops.totalInquiries}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
            </span>
          </Link>
          <Link
            href="/admin/inquiries?status=new"
            className="group flex items-center justify-between rounded-sm border border-ivory-300 bg-white px-4 py-4 shadow-sm transition-all hover:border-olive/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3 text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ivory-200 text-ink-muted group-hover:bg-olive/10 group-hover:text-olive">
                <MessageSquare className="h-4 w-4" />
              </span>
              {td("newInquiries")}
            </span>
            <span className="flex items-center gap-2 font-display text-2xl tabular-nums text-ink">
              {ops.newInquiries}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
