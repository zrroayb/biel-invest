import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";

import { PUBLIC_MESSAGES_CACHE_TAG } from "@/lib/cache-tags";
import {
  buildDefaultSiteContentFromMessages,
  mergeSiteContent,
} from "@/lib/site-content/defaults";
import { adminDb } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-env";
import { logError, logInfo, logWarn } from "@/lib/log/server";
import type { SiteContentV1 } from "@/types/site-content";

const DOC = "config/site_content" as const;

function docRef() {
  return adminDb.doc(DOC);
}

export async function getRawSiteContentDoc(): Promise<unknown> {
  const snap = await docRef().get();
  if (!snap.exists) return null;
  return snap.data() ?? null;
}

export async function getMergedSiteContent(): Promise<SiteContentV1> {
  const def = await buildDefaultSiteContentFromMessages();
  if (!isFirebaseAdminConfigured()) {
    logWarn("site-content", "skip_firestore_no_env");
    return def;
  }
  try {
    logInfo("site-content", "firestore_read_start", { doc: DOC });
    const raw = await getRawSiteContentDoc();
    logInfo("site-content", "firestore_read_ok", { hasOverrides: raw != null });
    return mergeSiteContent(def, raw);
  } catch (err) {
    logError("site-content", "firestore_read_failed_using_defaults", {}, err);
    return def;
  }
}

export async function getSiteContentForEditor(): Promise<{
  content: SiteContentV1;
  updatedAt: string | null;
}> {
  const [def, rawSnap] = await Promise.all([
    buildDefaultSiteContentFromMessages(),
    docRef().get(),
  ]);
  const raw = rawSnap.exists ? rawSnap.data() : null;
  const u = raw && "updatedAt" in raw ? (raw as { updatedAt?: Timestamp }).updatedAt : undefined;
  let updatedAt: string | null = null;
  if (u instanceof Timestamp) {
    updatedAt = u.toDate().toISOString();
  } else if (u && typeof (u as { toDate: () => Date }).toDate === "function") {
    updatedAt = (u as { toDate: () => Date }).toDate().toISOString();
  }
  // Firestore Timestamp is not JSON-serializable to Client Components — never merge it into `content`
  const rawForMerge = raw
    ? (() => {
        const { updatedAt: _drop, ...rest } = raw as Record<string, unknown> & {
          updatedAt?: unknown;
        };
        return rest;
      })()
    : null;
  return {
    content: mergeSiteContent(def, rawForMerge),
    updatedAt,
  };
}

export async function saveSiteContent(
  data: SiteContentV1,
): Promise<void> {
  await docRef().set(
    {
      ...data,
      version: 1,
      updatedAt: FieldValue.serverTimestamp(),
    } as SiteContentV1 & { updatedAt: FieldValue },
    { merge: true },
  );
  revalidateTag(PUBLIC_MESSAGES_CACHE_TAG);
}
