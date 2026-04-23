import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/en/admin",
          "/de/admin",
          "/ru/admin",
          "/api",
          "/favoriler",
          "/en/favoriler",
          "/de/favoriler",
          "/ru/favoriler",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
