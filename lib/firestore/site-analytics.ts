import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export type SiteAnalyticsType =
  | "page_view"
  | "favorite_add"
  | "favorite_remove";

export interface SiteAnalyticsEventRow {
  id: string;
  type: SiteAnalyticsType;
  path: string | null;
  propertyId: string | null;
  propertyLabel: string | null;
  visitorId: string;
  locale: string | null;
  userAgent: string | null;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  createdAt: Date;
}

export async function appendSiteAnalyticsEvent(params: {
  type: SiteAnalyticsType;
  path?: string | null;
  propertyId?: string | null;
  propertyLabel?: string | null;
  visitorId: string;
  locale?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
}): Promise<void> {
  await adminDb.collection("site_analytics_events").add({
    type: params.type,
    path: params.path ?? null,
    propertyId: params.propertyId ?? null,
    propertyLabel: params.propertyLabel ?? null,
    visitorId: params.visitorId,
    locale: params.locale ?? null,
    userAgent: params.userAgent ?? null,
    ip: params.ip ?? null,
    country: params.country ?? null,
    region: params.region ?? null,
    city: params.city ?? null,
    createdAt: Timestamp.now(),
  });
}

export async function listSiteAnalyticsEvents(
  limit = 5000,
): Promise<SiteAnalyticsEventRow[]> {
  const snap = await adminDb
    .collection("site_analytics_events")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: data.type as SiteAnalyticsType,
      path: (data.path as string | null) ?? null,
      propertyId: (data.propertyId as string | null) ?? null,
      propertyLabel: (data.propertyLabel as string | null) ?? null,
      visitorId: data.visitorId as string,
      locale: (data.locale as string | null) ?? null,
      userAgent: (data.userAgent as string | null) ?? null,
      ip: (data.ip as string | null) ?? null,
      country: (data.country as string | null) ?? null,
      region: (data.region as string | null) ?? null,
      city: (data.city as string | null) ?? null,
      createdAt: data.createdAt?.toDate?.() ?? new Date(0),
    };
  });
}
