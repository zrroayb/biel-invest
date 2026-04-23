import type { NextRequest } from "next/server";

export type RequestClientMeta = {
  ip: string | null;
  userAgent: string | null;
  /** ISO 3166-1 alpha-2 when provided by the platform (e.g. Vercel, Cloudflare). */
  country: string | null;
  /** Region / subdivision code when provided (e.g. Vercel). */
  region: string | null;
  /** City name when provided (e.g. Vercel). */
  city: string | null;
};

function header(request: NextRequest, name: string): string | null {
  const v = request.headers.get(name);
  if (!v?.trim()) return null;
  return v.trim();
}

/**
 * IP / UA always from the request. Geo comes from edge headers when deployed
 * (Vercel: x-vercel-ip-*, Cloudflare: cf-ipcountry). Local dev usually has no geo.
 *
 * @see https://vercel.com/docs/headers/request-headers
 */
export function getRequestClientMeta(request: NextRequest): RequestClientMeta {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent") ?? null;

  const country =
    header(request, "x-vercel-ip-country") ??
    header(request, "cf-ipcountry") ??
    null;

  const region = header(request, "x-vercel-ip-country-region") ?? null;

  const cityRaw = header(request, "x-vercel-ip-city") ?? null;
  const city = cityRaw
    ? decodeURIComponent(cityRaw.replace(/\+/g, " "))
    : null;

  return { ip, userAgent, country, region, city };
}
