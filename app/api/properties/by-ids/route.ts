import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100)
      : [];
    if (ids.length === 0) return NextResponse.json({ items: [] });

    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

    const results = await Promise.all(
      chunks.map((chunk) =>
        adminDb
          .collection("properties")
          .where("__name__", "in", chunk)
          .get(),
      ),
    );

    const items = results
      .flatMap((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      .map((raw: any) => ({
        id: raw.id,
        slug: raw.slug,
        type: raw.type,
        status: raw.status,
        region: raw.region,
        price: raw.price ?? 0,
        currency: raw.currency ?? "EUR",
        specs: raw.specs ?? {},
        features: raw.features ?? [],
        translations: raw.translations,
        media: raw.media ?? { cover: null, gallery: [] },
        featured: Boolean(raw.featured),
      }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ items: [] });
  }
}
