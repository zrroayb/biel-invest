import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { buildPropertyInputSchema } from "@/lib/validators";
import {
  getMergedPropertyTaxonomy,
  getRegionAndFeatureIdLists,
} from "@/lib/firestore/property-taxonomy";
import {
  deleteProperty,
  getPropertyById,
  updateProperty,
} from "@/lib/firestore/properties";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const property = await getPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ property });
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
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
  const updated = await updateProperty(id, parsed.data);
  return NextResponse.json({ property: updated });
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await deleteProperty(id);
  return NextResponse.json({ ok: true });
}
