import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Property, PropertyInput } from "@/types/property";
import { Timestamp } from "firebase-admin/firestore";

const COLLECTION = "properties";

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function docToProperty(
  id: string,
  data: FirebaseFirestore.DocumentData,
): Property {
  return {
    id,
    slug: data.slug,
    type: data.type,
    status: data.status,
    region: data.region,
    price: data.price ?? 0,
    currency: data.currency ?? "EUR",
    specs: data.specs ?? {},
    features: data.features ?? [],
    translations: data.translations,
    media: data.media ?? { cover: null, gallery: [] },
    coordinates: data.coordinates ?? null,
    featured: Boolean(data.featured),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export interface ListPropertiesParams {
  type?: string;
  region?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  features?: string[];
  featured?: boolean;
  sort?: "newest" | "priceAsc" | "priceDesc";
  limit?: number;
}

export async function listProperties(
  params: ListPropertiesParams = {},
): Promise<Property[]> {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTION);

  if (params.status) query = query.where("status", "==", params.status);
  if (params.type) query = query.where("type", "==", params.type);
  if (params.region) query = query.where("region", "==", params.region);
  if (params.featured) query = query.where("featured", "==", true);

  if (params.sort === "priceAsc") query = query.orderBy("price", "asc");
  else if (params.sort === "priceDesc") query = query.orderBy("price", "desc");
  else query = query.orderBy("createdAt", "desc");

  if (params.limit) query = query.limit(params.limit);

  const snap = await query.get();
  let items = snap.docs.map((d) => docToProperty(d.id, d.data()));

  if (params.priceMin != null)
    items = items.filter((p) => p.price >= params.priceMin!);
  if (params.priceMax != null)
    items = items.filter((p) => p.price <= params.priceMax!);
  if (params.bedrooms != null)
    items = items.filter(
      (p) => (p.specs.bedrooms ?? 0) >= (params.bedrooms ?? 0),
    );
  if (params.features && params.features.length > 0)
    items = items.filter((p) =>
      params.features!.every((f) => p.features.includes(f as never)),
    );

  return items;
}

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return docToProperty(doc.id, doc.data());
}

export async function getPropertyById(
  id: string,
): Promise<Property | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToProperty(doc.id, doc.data()!);
}

export async function createProperty(
  input: PropertyInput,
): Promise<Property> {
  const now = Timestamp.now();
  const docRef = await adminDb.collection(COLLECTION).add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  const doc = await docRef.get();
  return docToProperty(doc.id, doc.data()!);
}

export async function updateProperty(
  id: string,
  input: Partial<PropertyInput>,
): Promise<Property> {
  const ref = adminDb.collection(COLLECTION).doc(id);
  await ref.update({
    ...input,
    updatedAt: Timestamp.now(),
  });
  const doc = await ref.get();
  return docToProperty(doc.id, doc.data()!);
}

export async function deleteProperty(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
