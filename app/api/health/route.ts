import { NextResponse } from "next/server";
import { useNextDataCache } from "@/lib/cache-policy";
import {
  firebaseAdminEnvPresence,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin-env";

export const dynamic = "force-dynamic";

/** Public diagnostics (no secrets). Does not import firebase-admin unless `?deep=1`. */
export async function GET(request: Request) {
  try {
    const deep = new URL(request.url).searchParams.get("deep") === "1";
    const body: Record<string, unknown> = {
      ok: true,
      ts: new Date().toISOString(),
      firebaseConfigured: isFirebaseAdminConfigured(),
      hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
      node: process.version,
      nextRuntime: process.env.NEXT_RUNTIME ?? null,
      cfPages: process.env.CF_PAGES === "1",
      nextDataCache: useNextDataCache(),
      envPresence: {
        NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
        ...firebaseAdminEnvPresence(),
      },
    };

    if (deep && isFirebaseAdminConfigured()) {
      try {
        const { adminDb } = await import("@/lib/firebase/admin");
        const snap = await adminDb.doc("config/property_taxonomy").get();
        body.firestoreOk = true;
        body.firestoreDocExists = snap.exists;
      } catch (err) {
        body.firestoreOk = false;
        body.firestoreError =
          err instanceof Error ? err.message : String(err);
      }
    }
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
