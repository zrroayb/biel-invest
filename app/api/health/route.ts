import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { logInfo } from "@/lib/log/server";

/** Public diagnostics (no secrets). Check Cloudflare Real-time Logs + this URL. */
export async function GET() {
  const body = {
    ok: true,
    ts: new Date().toISOString(),
    firebaseConfigured: isFirebaseAdminConfigured(),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    node: process.version,
    nextRuntime: process.env.NEXT_RUNTIME ?? null,
    cfPages: process.env.CF_PAGES === "1",
  };
  logInfo("health", "ping", body);
  return NextResponse.json(body);
}
