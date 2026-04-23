# functions/ — optional Blaze-plan add-on

This folder is **not used** in the default Spark-plan setup. The inquiry email
notification runs inside the Next.js route handler at
`app/api/inquiries/route.ts` using the Resend SDK directly.

The code here is preserved for two reasons:

1. Reference implementation of the same logic as a Firestore trigger.
2. Easy migration path if you upgrade to the Blaze plan later and want
   background processing (e.g. thumbnail generation, scheduled digests,
   signed URL rotation).

## Enabling Functions (later)

1. Upgrade the Firebase project to Blaze.
2. Re-add the `functions` block in the root `firebase.json`:

   ```jsonc
   "functions": [
     {
       "source": "functions",
       "codebase": "default",
       "ignore": ["node_modules", ".git", "firebase-debug.log", "firebase-debug.*.log", "*.local"],
       "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
     }
   ]
   ```

3. Store the Resend secrets in Secret Manager:

   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   firebase functions:secrets:set INQUIRY_NOTIFICATION_EMAIL
   firebase functions:secrets:set INQUIRY_FROM_EMAIL
   ```

4. Deploy:

   ```bash
   npm --prefix functions install
   npm run firebase:deploy:functions
   ```

If you keep sending mail from the Next.js route, also either (a) delete the
`sendInquiryEmail` call in the route, or (b) leave both — the trigger is
idempotent-enough for the small duplicate volume.
