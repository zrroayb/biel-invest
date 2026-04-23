import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { Inquiry, InquiryInput, InquiryStatus } from "@/types/inquiry";

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
  await adminDb.collection(COLLECTION).doc(id).update({ status });
}
