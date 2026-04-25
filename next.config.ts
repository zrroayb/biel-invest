import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Packages loaded from node_modules on the server avoid broken vendor-chunks after
  // interrupted dev builds (OpenTelemetry, FormatJS, etc.). Do **not** add `next-intl` /
  // `use-intl` here — it can break the server bundle (missing vendor-chunks/next-intl.js).
  // If the browser floods 404s for `/_next/static/**` JS chunks, stop dev and run:
  // `npm run dev:clean` (deletes `.next` then starts dev).
  serverExternalPackages: [
    // firebase-admin → gRPC; bundling can yield missing vendor-chunks/@grpc*.js in dev
    "firebase-admin",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "google-gax",
    "@opentelemetry/api",
    "intl-messageformat",
    "@formatjs/ecma402-abstract",
    "@formatjs/fast-memoize",
    "@formatjs/icu-messageformat-parser",
    "@formatjs/icu-skeleton-parser",
    "@formatjs/intl-localematcher",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Kept for backwards compatibility if you ever migrate back to
      // Firebase Storage. Safe to remove once all uploads are on Cloudinary.
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withNextIntl(nextConfig);
