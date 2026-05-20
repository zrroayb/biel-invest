import "server-only";

import type { App, ServiceAccount } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import type { Storage } from "firebase-admin/storage";
import { logError, logInfo } from "@/lib/log/server";

export { isFirebaseAdminConfigured } from "./admin-env";

let cachedApp: App | null = null;
let initLogged = false;

/** Lazy require so Workers do not load firebase-admin until first use. */
function firebaseAppModule() {
  return require("firebase-admin/app") as typeof import("firebase-admin/app");
}

function firebaseAuthModule() {
  return require("firebase-admin/auth") as typeof import("firebase-admin/auth");
}

function firebaseFirestoreModule() {
  return require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
}

function firebaseStorageModule() {
  return require("firebase-admin/storage") as typeof import("firebase-admin/storage");
}

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const { cert, getApps, initializeApp } = firebaseAppModule();
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    logError("firebase-admin", "init_missing_env", {
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(rawPrivateKey),
    });
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  try {
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
    };

    cachedApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    if (!initLogged) {
      initLogged = true;
      logInfo("firebase-admin", "init_ok", { projectId });
    }
    return cachedApp;
  } catch (err) {
    logError("firebase-admin", "init_failed", { projectId }, err);
    throw err;
  }
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
      const { getAuth } = firebaseAuthModule();
      const real = getAuth(getAdminApp()) as unknown as Record<string, unknown>;
      const value = real[prop as string];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
) as Auth;

export const adminDb = new Proxy(
  {},
  {
    get(_t, prop) {
      const { getFirestore } = firebaseFirestoreModule();
      const real = getFirestore(getAdminApp()) as unknown as Record<
        string,
        unknown
      >;
      const value = real[prop as string];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
) as Firestore;

/**
 * @deprecated Firebase Storage requires Blaze on new projects.
 */
export const adminStorage = new Proxy(
  {},
  {
    get(_t, prop) {
      const { getStorage } = firebaseStorageModule();
      const real = getStorage(getAdminApp()) as unknown as Record<
        string,
        unknown
      >;
      const value = real[prop as string];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
) as Storage;
