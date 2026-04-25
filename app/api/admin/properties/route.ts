import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  buildPropertyInputSchema,
} from "@/lib/validators";
import {
  getMergedPropertyTaxonomy,
  getRegionAndFeatureIdLists,
} from "@/lib/firestore/property-taxonomy";
import {
  createProperty,
  listProperties,
} from "@/lib/firestore/properties";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await listProperties({ limit: 500 });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const tax = await getMergedPropertyTaxonomy();
  const parsed = buildPropertyInputSchema(
    getRegionAndFeatureIdLists(tax),
  ).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await createProperty(parsed.data);
  return NextResponse.json({ property: created }, { status: 201 });
}
