import { siteBaseUrl } from "@/lib/seo/urls";

export function HomeJsonLd() {
  const base = siteBaseUrl();
  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: "BIEL Invest",
      url: base,
      logo: `${base}/brand/biel-invest.svg`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bodrum",
        addressRegion: "Muğla",
        addressCountry: "TR",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: "BIEL Invest",
      url: base,
      publisher: { "@id": `${base}/#organization` },
      inLanguage: ["tr", "en", "de", "ru"],
    },
  ];

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
