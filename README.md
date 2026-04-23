# Bodrum Estate

Premium real-estate portfolio website for a Bodrum-based firm.

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Host**: Vercel (app) + Firebase (data/assets/mail)
- **Languages**: TR (default), EN, DE, RU
- **Admin**: custom panel at `/admin` (Firebase Auth; allowlist in `admins/{uid}`)

## Project Structure

```
app/
  [locale]/
    (public)/          # ziyaretçi sayfaları
      page.tsx         # ana sayfa
      portfoy/         # portföy + detay
      hakkimizda/      # hakkımızda
      iletisim/        # iletişim
      favoriler/       # favoriler (localStorage)
    admin/
      login/           # admin giriş
      (panel)/         # dashboard, properties, inquiries (auth korumalı)
  api/
    auth/session/      # session cookie
    inquiries/         # public: form submit
    admin/             # admin-only: CRUD + upload + inquiries patch
    properties/by-ids/ # favoriler için
components/
  layout/  motion/  home/  property/
lib/
  firebase/{client,admin}.ts
  firestore/{properties,inquiries}.ts
  auth/session.ts
  favorites.ts  utils.ts  validators.ts
messages/             # 4 dil JSON
types/                # Property, Inquiry, LocaleKey
functions/            # Firebase Cloud Functions (mail bildirim)
firestore.rules  storage.rules  firestore.indexes.json  firebase.json
scripts/seed.ts       # demo veri
```

## Quick Start

```bash
# 1) Install
npm install
cd functions && npm install && cd ..

# 2) Copy env and fill values
cp .env.example .env.local

# 3) Dev
npm run dev
# -> http://localhost:3000
```

## Environment Variables

See `.env.example`. Required for production:

- **Public Firebase config** (`NEXT_PUBLIC_FIREBASE_*`): from Firebase Console → Project Settings → General
- **Admin SDK** (`FIREBASE_ADMIN_*`): generate a service account JSON. `FIREBASE_ADMIN_PRIVATE_KEY` keeps `\n` escapes
- **Resend** (`RESEND_API_KEY`): required for inquiry email notifications
- **Site** (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_*`)

## Firebase Setup (one-time)

```bash
# 1) Create two projects in Firebase Console: bodrum-re-dev, bodrum-re-prod
# 2) Enable Firestore, Authentication (Email/Password), Storage, Functions
# 3) Login and pick project
npm i -g firebase-tools
firebase login
firebase use --add   # choose prod alias
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Create the first admin user

1. In Firebase Console → Authentication → Add user (email + strong password).
2. Copy that user's UID.
3. In Firestore, create document `admins/{uid}` (any content, e.g. `{ email: "..." }`). The `admins` collection is the allowlist.

## Seeding Demo Data

```bash
npm run seed
```

Adds 9 example properties across Bodrum regions (EN/TR/DE/RU translations). Idempotent — re-running skips existing slugs.

## Admin Panel Usage (for the client)

1. Go to `yourdomain.com/admin/login`, sign in.
2. **Dashboard** shows total / active properties and new inquiries.
3. **Properties**:
   - New → fill Basic (slug auto from title), Translations (TR/EN/DE/RU tabs), Specs, Features, Media (drag upload, set cover), Virtual Tour URL.
   - Edit existing → same form, Save / Delete.
4. **Inquiries**: tabs All / New / Read / Replied. Each card → mark as read / replied; click email/phone to reply.
5. **Logout** from bottom-left.

## Deploy

### Vercel (app)

1. Connect repo on vercel.com → New Project → import.
2. Add environment variables (Production + Preview).
3. Set regions to `fra1` (closest to Turkey).
4. Deploy. Connect the production domain under Settings → Domains.

### Firebase (rules + functions)

GitHub Action in `.github/workflows/firebase-deploy.yml` deploys on push to `main`.

Required GitHub secrets:
- `FIREBASE_PROJECT_ID`
- `GCP_SA_KEY` — service account JSON (Firebase Admin + Cloud Functions roles)

Also set Firebase function secrets:

```bash
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set INQUIRY_NOTIFICATION_EMAIL
firebase functions:secrets:set INQUIRY_FROM_EMAIL
```

## Design Notes

- **Palette**: ivory `#FAF7F2`, ink `#1C1C1C`, olive accent `#3F5D4F`, sand `#D9CBB4`. Logodan gelecek kurumsal renge göre `tailwind.config.ts` → `colors.olive` güncellenecek.
- **Typography**: Fraunces (display serif), Inter (body sans).
- **Motion**: Framer Motion + `Reveal` component for scroll-triggered fade/translate.
- **Grid**: centered container, max-width 1440px; hairline dividers; generous whitespace.

## i18n

- Default locale: `tr`. URLs: `/`, `/en/...`, `/de/...`, `/ru/...`
- UI strings: `messages/*.json`.
- Content (property title/description/highlights) stored per-locale in Firestore `translations.{tr|en|de|ru}`.
- `hreflang` + multi-locale sitemap generated in `app/sitemap.ts`.

## Security

- Firestore rules: properties public read, write admin-only; inquiries public create (validated), admin read.
- Storage rules: public read under `properties/**`, admin-only writes ≤15MB image/video.
- Admin routes guarded by `__session` cookie and middleware; API routes re-check session.
- Form rate-limit (5/min per IP) + honeypot field.

## Handoff Checklist

- [ ] Client logo received (SVG)
- [ ] Palette + typography finalized from logo
- [ ] Domain DNS pointed at Vercel
- [ ] Firebase prod project billing enabled (Blaze, for Functions + Storage)
- [ ] Resend API key set in Vercel + Firebase function secrets
- [ ] First admin user created in `admins/{uid}`
- [ ] Real property content uploaded via admin panel
- [ ] Client walkthrough recorded (admin panel)
- [ ] Analytics (Plausible or GA4) wired
