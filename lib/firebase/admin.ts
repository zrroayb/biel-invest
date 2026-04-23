import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let cachedApp: App | null = null;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
  };

  cachedApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return cachedApp;
}

export const adminApp = {
  get instance() {
    return getAdminApp();
  },
};

export const adminAuth = new Proxy(
  {},
  {
    get(_t, prop) {
      const real = getAuth(getAdminApp()) as unknown as Record<string, unknown>;
      const value = real[prop as string];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
) as ReturnType<typeof getAuth>;

export const adminDb = new Proxy(
  {},
  {
    get(_t, prop) {
      const real = getFirestore(getAdminApp()) as unknown as Record<
        string,
        unknown
      >;
      const value = real[prop as string];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
) as ReturnType<typeof getFirestore>;

/**
 * @deprecated Firebase Storage requires Blaze on new projects. This project
 * now uses Cloudinary for media (see `app/api/admin/upload/route.ts`). The
 * export is kept for backwards compatibility; calling it will throw unless
 * you've upgraded to Blaze and re-enabled Storage.
 */
export const adminStorage = new Proxy(
  {},
  {
    get(_t, prop) {
      const real = getStorage(getAdminApp()) as unknown as Record<
        string,
        unknown
      >;
      const value = real[prop as string];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
) as ReturnType<typeof getStorage>;
