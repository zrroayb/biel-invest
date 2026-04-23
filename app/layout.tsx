import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "BIEL Invest — Curated Properties of the Aegean",
    template: "%s · BIEL Invest",
  },
  description:
    "A curated portfolio of villas, land and residences in Bodrum and the Aegean coast.",
  icons: {
    icon: [
      { url: "/brand/biel-invest.svg", type: "image/svg+xml" },
    ],
    shortcut: "/brand/biel-invest.svg",
    apple: "/brand/biel-invest.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
