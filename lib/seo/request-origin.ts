import { headers } from "next/headers";
import { siteBaseUrl } from "@/lib/seo/urls";

function originFromEnv(): string {
  try {
    return new URL(siteBaseUrl()).origin;
  } catch {
    return siteBaseUrl().replace(/\/$/, "");
  }
}

/**
 * Origin for canonical + hreflang so alternates match the URL the crawler (and user) actually sees.
 * Falls back to NEXT_PUBLIC_SITE_URL when no Host header (e.g. certain prerender paths).
 */
export async function getPublicOriginForMetadata(): Promise<string> {
  const h = await headers();
  const hostRaw = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const host = hostRaw.split(",")[0]?.trim() ?? "";
  if (!host) return originFromEnv();

  const protoRaw = h.get("x-forwarded-proto") ?? "https";
  const protoHead = protoRaw.split(",")[0]?.trim() ?? "https";
  const proto = protoHead === "http" ? "http" : "https";

  return `${proto}://${host}`;
}
