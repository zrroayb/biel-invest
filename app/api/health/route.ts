import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-env";

export const dynamic = "force-dynamic";

/** Public diagnostics (no secrets). Does not import firebase-admin. */
export async function GET() {
  try {
    const body = {
      ok: true,
      ts: new Date().toISOString(),
      firebaseConfigured: isFirebaseAdminConfigured(),
      hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
      node: process.version,
      nextRuntime: process.env.NEXT_RUNTIME ?? null,
      cfPages: process.env.CF_PAGES === "1",
    };
    console.log(`[bodrum] ${JSON.stringify({ level: "info", scope: "health", event: "ping", ...body })}`);
    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[bodrum] ${JSON.stringify({
        level: "error",
        scope: "health",
        event: "handler_failed",
        message,
      })}`,
    );
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
