import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Firebase (and other deps) pull @opentelemetry/api; bundling it as a vendor
  // chunk can break after interrupted dev builds — load from node_modules instead.
  serverExternalPackages: ["@opentelemetry/api"],
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
