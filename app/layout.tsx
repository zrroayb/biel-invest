import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BIEL Invest — Bodrum ve Ege'de seçkin mülkler",
    template: "%s · BIEL Invest",
  },
  description:
    "Bodrum, Yalıkavak ve Ege kıyılarında villa, arsa, rezidans ve seçilmiş gayrimenkul portföyü.",
  applicationName: "BIEL Invest",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/brand/biel-invest.svg", type: "image/svg+xml" },
    ],
    shortcut: "/brand/biel-invest.svg",
    apple: "/brand/biel-invest.svg",
  },
  openGraph: {
    type: "website",
    siteName: "BIEL Invest",
    locale: "tr_TR",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const fromHeader = h.get("x-next-intl-locale");
  const htmlLang =
    fromHeader && routing.locales.includes(fromHeader as (typeof routing.locales)[number])
      ? fromHeader
      : routing.defaultLocale;

  return (
    <html
      lang={htmlLang}
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
