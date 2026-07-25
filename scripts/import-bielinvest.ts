/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * bielinvest (eski Laravel sitesi) -> biel-invest (Next.js + Firestore + Cloudinary)
 * ilan aktarım scripti.
 *
 * Ne yapar:
 *   1) data/properties.import.json içindeki 97 ilanı okur.
 *   2) Her ilanın görsellerini yerel yedekteki public/uploads klasöründen
 *      Cloudinary'ye yükler, secure_url'leri media.cover / media.gallery'ye yazar.
 *   3) İlanı Firestore `properties` koleksiyonuna ekler (slug'a göre tekilleştirir).
 *   4) İstenirse data/property_taxonomy.json'u `config/property_taxonomy`'ye yazar.
 *
 * Tekrar çalıştırılabilir: yüklenen görseller .import-manifest.json'a kaydedilir,
 * var olan slug'lar atlanır. Kesilirse baştan zarar vermeden devam eder.
 *
 * Çalıştırma:
 *   UPLOADS_DIR=/mutlak/yol/backup.../homedir/public_html/public/uploads \
 *     npx tsx scripts/import-bielinvest.ts [--limit N] [--dry-run] [--taxonomy] [--force]
 *
 * Gerekli .env.local değişkenleri:
 *   FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// ---------- argümanlar ----------
const args = process.argv.slice(2);
const has = (f: string) => args.includes(f);
const num = (f: string, d: number) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d;
};
const LIMIT = num("--limit", Infinity);
const DRY = has("--dry-run");
const DO_TAXONOMY = has("--taxonomy");
const FORCE = has("--force"); // var olan slug'ların üstüne yaz

// ---------- yollar ----------
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data");
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : "";
const MANIFEST = join(DATA_DIR, ".import-manifest.json");

// ---------- env kontrol ----------
function need(keys: string[]) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Eksik ortam değişkenleri:", missing.join(", "));
    console.error("Bunları .env.local dosyasına ekleyin.");
    process.exit(1);
  }
}
need([
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
]);
if (!DRY) {
  need(["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]);
  if (!UPLOADS_DIR || !existsSync(UPLOADS_DIR)) {
    console.error(
      "UPLOADS_DIR bulunamadı. Örn: UPLOADS_DIR=/.../public_html/public/uploads",
    );
    process.exit(1);
  }
}

// ---------- init ----------
if (!getApps()[0]) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n",
      ),
    }),
  });
}
const db = getFirestore();

if (!DRY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ---------- manifest (resume) ----------
type Manifest = Record<string, { url: string; publicId: string }>;
const manifest: Manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};
function saveManifest() {
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
}

async function uploadImage(localRel: string, slug: string): Promise<string | null> {
  if (manifest[localRel]) return manifest[localRel].url; // zaten yüklendi
  const abs = join(UPLOADS_DIR, localRel);
  if (!existsSync(abs)) {
    console.warn(`   ! görsel yok, atlanıyor: ${localRel}`);
    return null;
  }
  const res: UploadApiResponse = await cloudinary.uploader.upload(abs, {
    folder: `properties/${slug}`,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
    use_filename: true,
    eager: [
      { width: 2400, crop: "limit", fetch_format: "auto", quality: "auto:good" },
    ],
  });
  manifest[localRel] = { url: res.secure_url, publicId: res.public_id };
  saveManifest();
  return res.secure_url;
}

// ---------- data ----------
type ImportProperty = {
  _localImages: string[];
  slug: string;
  [k: string]: any;
};
const all: ImportProperty[] = JSON.parse(
  readFileSync(join(DATA_DIR, "properties.import.json"), "utf8"),
);
const properties = all.slice(0, LIMIT === Infinity ? all.length : LIMIT);

async function importTaxonomy() {
  const tax = JSON.parse(
    readFileSync(join(DATA_DIR, "property_taxonomy.json"), "utf8"),
  );
  const ref = db.doc("config/property_taxonomy");
  const snap = await ref.get();
  if (snap.exists && !FORCE) {
    console.log(
      "config/property_taxonomy zaten var — atlanıyor (--force ile üzerine yaz).",
    );
    return;
  }
  if (DRY) {
    console.log(
      `[dry-run] taksonomi yazılacaktı: ${tax.regions.length} bölge, ${tax.features.length} özellik`,
    );
    return;
  }
  await ref.set({ ...tax, updatedAt: Timestamp.now() });
  console.log(
    `config/property_taxonomy yazıldı: ${tax.regions.length} bölge, ${tax.features.length} özellik`,
  );
}

async function run() {
  if (DO_TAXONOMY) await importTaxonomy();

  console.log(
    `${properties.length} ilan aktarılıyor${DRY ? " (dry-run)" : ""}...`,
  );
  const now = Timestamp.now();
  let added = 0,
    skipped = 0,
    uploaded = 0;

  for (const p of properties) {
    const { _localImages = [], _sourceId, _country, _city, _state, ...doc } = p;

    // var olan slug kontrolü
    const existing = await db
      .collection("properties")
      .where("slug", "==", p.slug)
      .limit(1)
      .get();
    if (!existing.empty && !FORCE) {
      console.log(` - atla (mevcut): ${p.slug}`);
      skipped++;
      continue;
    }

    // görseller
    const urls: string[] = [];
    if (!DRY) {
      for (const img of _localImages) {
        const url = await uploadImage(img, p.slug);
        if (url) {
          urls.push(url);
          uploaded++;
        }
      }
    }
    doc.media = {
      cover: urls[0] ?? null,
      gallery: urls,
      videoUrl: null,
      virtualTourUrl: null,
    };

    if (DRY) {
      console.log(
        ` [dry] ${p.slug} — ${_localImages.length} görsel, bölge=${p.region}, tip=${p.type}, ${p.price} ${p.currency}`,
      );
      added++;
      continue;
    }

    const payload = { ...doc, createdAt: now, updatedAt: now };
    if (!existing.empty && FORCE) {
      await existing.docs[0].ref.set(payload, { merge: true });
      console.log(` ~ güncellendi: ${p.slug} (${urls.length} görsel)`);
    } else {
      await db.collection("properties").add(payload);
      console.log(` + eklendi: ${p.slug} (${urls.length} görsel)`);
    }
    added++;
  }

  console.log(
    `\nBitti. eklenen/güncellenen=${added}, atlanan=${skipped}, yüklenen görsel=${uploaded}`,
  );
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  saveManifest();
  process.exit(1);
});
