import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-env";
import { Timestamp } from "firebase-admin/firestore";
import type { Inquiry, InquiryInput, InquiryStatus } from "@/types/inquiry";
import { listLocalInquiries } from "@/lib/local-data/inquiries";

const COLLECTION = "inquiries";

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function docToInquiry(
  id: string,
  data: FirebaseFirestore.DocumentData,
): Inquiry {
  return {
    id,
    propertyId: data.propertyId ?? null,
    propertySlug: data.propertySlug ?? null,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    message: data.message,
    locale: data.locale,
    source: data.source ?? "form",
    status: data.status ?? "new",
    createdAt: toIso(data.createdAt),
  };
}

export async function createInquiry(input: InquiryInput): Promise<Inquiry> {
  // Firebase yoksa (yerel/demo modu): kalıcı kayıt yok, formu çökertmeden yanıtla.
  if (!isFirebaseAdminConfigured()) {
    return {
      id: `local-${Date.now()}`,
      propertyId: input.propertyId ?? null,
      propertySlug: input.propertySlug ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
      locale: input.locale,
      source: "form",
      status: "new",
      createdAt: new Date().toISOString(),
    };
  }
  const ref = await adminDb.collection(COLLECTION).add({
    ...input,
    propertyId: input.propertyId ?? null,
    propertySlug: input.propertySlug ?? null,
    phone: input.phone ?? null,
    source: "form",
    status: "new",
    createdAt: Timestamp.now(),
  });
  const doc = await ref.get();
  return docToInquiry(doc.id, doc.data()!);
}

export async function listInquiries(
  status?: InquiryStatus | "all",
): Promise<Inquiry[]> {
  if (!isFirebaseAdminConfigured()) {
    return listLocalInquiries(status);
  }
  let query: FirebaseFirestore.Query = adminDb
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200);
  if (status && status !== "all") {
    query = adminDb
      .collection(COLLECTION)
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(200);
  }
  const snap = await query.get();
  return snap.docs.map((d) => docToInquiry(d.id, d.data()));
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<void> {
  // Yerel modda kalıcı depo yok; sessizce geç (panel çökmesin).
  if (!isFirebaseAdminConfigured()) return;
  await adminDb.collection(COLLECTION).doc(id).update({ status });
}
