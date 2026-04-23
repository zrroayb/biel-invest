"use client";

import { getOrCreateVisitorId } from "./visitor-id";

async function post(body: Record<string, unknown>) {
  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;
  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, visitorId }),
    });
  } catch {
    /* ignore */
  }
}

export function trackPageView(path: string, locale?: string) {
  return post({ type: "page_view", path, locale });
}

export function trackFavoriteAdd(
  propertyId: string,
  opts?: { propertyLabel?: string; path?: string; locale?: string },
) {
  return post({
    type: "favorite_add",
    propertyId,
    propertyLabel: opts?.propertyLabel,
    path: opts?.path,
    locale: opts?.locale,
  });
}

export function trackFavoriteRemove(
  propertyId: string,
  opts?: { path?: string; locale?: string },
) {
  return post({
    type: "favorite_remove",
    propertyId,
    path: opts?.path,
    locale: opts?.locale,
  });
}
