import type { SiteAnalyticsEventRow } from "@/lib/firestore/site-analytics";

export type DayBucket = { dayKey: string; label: string; count: number };

export type GeoBucket = {
  country: string | null;
  region: string | null;
  city: string | null;
  /** Human-readable: city · region · country (omits empty parts). */
  label: string;
  /** Page views in this bucket (geo from edge when the view was recorded). */
  count: number;
};

export type VisitorBehaviorDashboard = {
  windowDays: number;
  windowStart: Date;
  windowEnd: Date;
  uniqueVisitors: number;
  pageViews: number;
  favoriteAdds: number;
  favoriteRemoves: number;
  /** Newest-first, capped */
  recentEvents: SiteAnalyticsEventRow[];
  viewsByDay: DayBucket[];
  topPaths: { path: string; count: number }[];
  /** Page views grouped by inferred location (Vercel / Cloudflare headers). */
  topGeo: GeoBucket[];
  topFavoriteProperties: {
    propertyId: string;
    label: string;
    count: number;
  }[];
};

function geoBucketLabel(
  country: string | null,
  region: string | null,
  city: string | null,
): string {
  const parts = [city, region, country].filter(Boolean) as string[];
  return parts.length ? parts.join(" · ") : "";
}

function dayKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(dayKey: string, locale: string): string {
  const [y, m, day] = dayKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  return dt.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * Aggregates raw analytics rows (newest-first from Firestore) for a rolling window.
 */
export function aggregateVisitorBehaviorDashboard(
  events: SiteAnalyticsEventRow[],
  options: {
    windowDays: number;
    recentLimit: number;
    /** Locale for short day labels on chart */
    locale: string;
  },
): VisitorBehaviorDashboard {
  const { windowDays, recentLimit, locale } = options;
  const windowEnd = new Date();
  const windowStart = new Date(
    windowEnd.getTime() - windowDays * 24 * 60 * 60 * 1000,
  );

  const inWindow = events.filter((e) => e.createdAt >= windowStart);

  const visitors = new Set<string>();
  let pageViews = 0;
  let favoriteAdds = 0;
  let favoriteRemoves = 0;
  const pathCounts = new Map<string, number>();
  const favCounts = new Map<
    string,
    { count: number; label: string }
  >();
  const viewsPerDay = new Map<string, number>();
  const geoCounts = new Map<
    string,
    { country: string | null; region: string | null; city: string | null; count: number }
  >();

  for (const e of inWindow) {
    visitors.add(e.visitorId);
    if (e.type === "page_view") {
      pageViews += 1;
      if (e.path) {
        pathCounts.set(e.path, (pathCounts.get(e.path) ?? 0) + 1);
        const dk = dayKeyUTC(e.createdAt);
        viewsPerDay.set(dk, (viewsPerDay.get(dk) ?? 0) + 1);
      }
      const gk = [e.country ?? "", e.region ?? "", e.city ?? ""].join("\t");
      const gcur = geoCounts.get(gk) ?? {
        country: e.country,
        region: e.region,
        city: e.city,
        count: 0,
      };
      gcur.count += 1;
      geoCounts.set(gk, gcur);
    } else if (e.type === "favorite_add") {
      favoriteAdds += 1;
      if (e.propertyId) {
        const cur = favCounts.get(e.propertyId) ?? {
          count: 0,
          label: e.propertyLabel || e.propertyId,
        };
        cur.count += 1;
        if (e.propertyLabel) cur.label = e.propertyLabel;
        favCounts.set(e.propertyId, cur);
      }
    } else if (e.type === "favorite_remove") {
      favoriteRemoves += 1;
    }
  }

  const dayKeys: string[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(windowEnd.getTime() - i * 24 * 60 * 60 * 1000);
    dayKeys.push(dayKeyUTC(d));
  }

  const viewsByDay: DayBucket[] = dayKeys.map((dayKey) => ({
    dayKey,
    label: formatDayLabel(dayKey, locale),
    count: viewsPerDay.get(dayKey) ?? 0,
  }));

  const topPaths = [...pathCounts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topFavoriteProperties = [...favCounts.entries()]
    .map(([propertyId, v]) => ({
      propertyId,
      label: v.label,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topGeo: GeoBucket[] = [...geoCounts.values()]
    .map((v) => ({
      country: v.country,
      region: v.region,
      city: v.city,
      label: geoBucketLabel(v.country, v.region, v.city),
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const recentEvents = inWindow.slice(0, recentLimit);

  return {
    windowDays,
    windowStart,
    windowEnd,
    uniqueVisitors: visitors.size,
    pageViews,
    favoriteAdds,
    favoriteRemoves,
    recentEvents,
    viewsByDay,
    topPaths,
    topGeo,
    topFavoriteProperties,
  };
}
