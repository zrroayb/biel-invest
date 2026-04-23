import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendSiteAnalyticsEvent } from "@/lib/firestore/site-analytics";
import { getRequestClientMeta } from "@/lib/http/client-meta";

const uuid = z.string().uuid();

const bodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("page_view"),
    path: z.string().min(1).max(512),
    visitorId: uuid,
    locale: z.string().max(12).optional(),
  }),
  z.object({
    type: z.literal("favorite_add"),
    propertyId: z.string().min(1).max(128),
    visitorId: uuid,
    propertyLabel: z.string().max(400).optional(),
    path: z.string().max(512).optional(),
    locale: z.string().max(12).optional(),
  }),
  z.object({
    type: z.literal("favorite_remove"),
    propertyId: z.string().min(1).max(128),
    visitorId: uuid,
    path: z.string().max(512).optional(),
    locale: z.string().max(12).optional(),
  }),
]);

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { ip, userAgent } = getRequestClientMeta(request);
  const payload = parsed.data;

  try {
    if (payload.type === "page_view") {
      await appendSiteAnalyticsEvent({
        type: "page_view",
        path: payload.path,
        visitorId: payload.visitorId,
        locale: payload.locale ?? null,
        ip,
        userAgent,
      });
    } else if (payload.type === "favorite_add") {
      await appendSiteAnalyticsEvent({
        type: "favorite_add",
        propertyId: payload.propertyId,
        propertyLabel: payload.propertyLabel ?? null,
        path: payload.path ?? null,
        visitorId: payload.visitorId,
        locale: payload.locale ?? null,
        ip,
        userAgent,
      });
    } else {
      await appendSiteAnalyticsEvent({
        type: "favorite_remove",
        propertyId: payload.propertyId,
        path: payload.path ?? null,
        visitorId: payload.visitorId,
        locale: payload.locale ?? null,
        ip,
        userAgent,
      });
    }
  } catch (err) {
    console.error("site analytics append failed", err);
  }

  return NextResponse.json({ ok: true });
}
