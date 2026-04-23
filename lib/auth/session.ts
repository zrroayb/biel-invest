import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "__session";
const FIVE_DAYS = 60 * 60 * 24 * 5 * 1000;

export async function createSessionCookie(idToken: string) {
  return adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS });
}

export interface AdminSession {
  uid: string;
  email?: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decoded.uid)
      .get();
    if (!adminDoc.exists) return null;
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
