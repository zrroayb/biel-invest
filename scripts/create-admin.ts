/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Create (or update) an admin user for the BIEL Invest panel.
 *
 *   npm run create-admin -- admin@example.com "StrongPass!23" "Full Name"
 *
 * What it does:
 *   1. Ensures a Firebase Auth user exists (creates one if needed,
 *      or resets the password if the email is already registered).
 *   2. Writes an allowlist document at `admins/{uid}` — the server-side
 *      session guard requires this document to exist.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n",
);

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_ADMIN_* env vars. Fill them in .env.local first.",
  );
  process.exit(1);
}

if (!getApps()[0]) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();
const db = getFirestore();

async function run() {
  const [, , email, password, displayName] = process.argv;

  if (!email || !password) {
    console.error(
      'Usage: npm run create-admin -- <email> <password> ["Display Name"]',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  let user: any;
  try {
    user = await auth.getUserByEmail(email);
    console.log(` • user exists (${user.uid}) — resetting password`);
    user = await auth.updateUser(user.uid, {
      password,
      displayName: displayName ?? user.displayName ?? undefined,
      emailVerified: true,
    });
  } catch (err: any) {
    if (err?.code !== "auth/user-not-found") throw err;
    console.log(" • creating new Firebase Auth user…");
    user = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });
  }

  const now = Timestamp.now();
  const adminRef = db.collection("admins").doc(user.uid);
  const existing = await adminRef.get();
  await adminRef.set(
    {
      email,
      displayName: displayName ?? user.displayName ?? null,
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: now }),
    },
    { merge: true },
  );

  console.log("");
  console.log(" Admin ready");
  console.log(`   uid      : ${user.uid}`);
  console.log(`   email    : ${email}`);
  console.log(`   password : ${"*".repeat(password.length)}`);
  console.log("");
  console.log("Login at /admin/login with these credentials.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
