/** Env-only checks — no firebase-admin import (safe on Cloudflare Workers). */

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim(),
  );
}

/** Safe for /api/health — booleans only, no secret values. */
export function firebaseAdminEnvPresence() {
  return {
    FIREBASE_ADMIN_PROJECT_ID: Boolean(
      process.env.FIREBASE_ADMIN_PROJECT_ID?.trim(),
    ),
    FIREBASE_ADMIN_CLIENT_EMAIL: Boolean(
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim(),
    ),
    FIREBASE_ADMIN_PRIVATE_KEY: Boolean(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim(),
    ),
  };
}
