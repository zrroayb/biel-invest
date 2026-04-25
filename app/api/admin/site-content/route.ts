import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  buildDefaultSiteContentFromMessages,
  mergeSiteContent,
} from "@/lib/site-content/defaults";
import {
  getSiteContentForEditor,
  saveSiteContent,
} from "@/lib/firestore/site-content";
import type { SiteContentV1 } from "@/types/site-content";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSiteContentForEditor());
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body: unknown = await request.json();
  const def = await buildDefaultSiteContentFromMessages();
  const merged = mergeSiteContent(def, body) as SiteContentV1;
  merged.version = 1;
  try {
    await saveSiteContent(merged);
  } catch (e) {
    console.error("saveSiteContent", e);
    return NextResponse.json(
      { error: (e as Error).message ?? "Save failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
