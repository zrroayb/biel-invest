import { config } from "dotenv";
config({ path: ".env.local" });

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n",
);

if (!getApps()[0]) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function main() {
  const auth = getAuth();
  const db = getFirestore();

  const users = await auth.listUsers(1);
  console.log("✓ Auth reachable. Existing users:", users.users.length);

  const snap = await db.collection("_smoke").limit(1).get();
  console.log("✓ Firestore reachable. _smoke size:", snap.size);

  console.log("Project:", projectId);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ FAIL:", e.message);
  process.exit(1);
});
