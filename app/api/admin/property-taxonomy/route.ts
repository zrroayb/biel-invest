import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  getPropertyTaxonomyForEditor,
  savePropertyTaxonomy,
} from "@/lib/firestore/property-taxonomy";
import type { PropertyTaxonomyV1 } from "@/types/property-taxonomy";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getPropertyTaxonomyForEditor());
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as PropertyTaxonomyV1;
  try {
    await savePropertyTaxonomy(body);
  } catch (e) {
    const msg = (e as Error).message ?? "Save failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
