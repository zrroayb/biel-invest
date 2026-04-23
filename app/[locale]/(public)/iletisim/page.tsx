import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { buildPublicPageMetadata } from "@/lib/seo/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPublicPageMetadata({
    locale,
    pathSegment: "/iletisim",
    title: t("contactTitle"),
    description: t("contactDescription"),
  });
}
import { InquiryForm } from "@/components/property/inquiry-form";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { Mail, MapPin, Phone } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@example.com";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+90 252 000 00 00";

  return (
    <div className="pt-[72px]">
      <section className="border-b border-ivory-300 bg-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="eyebrow">Bodrum · Ege</div>
            <h1 className="mt-3 font-display text-display-lg text-ink">
              {t("title")}
            </h1>
            <p className="mt-3 text-base text-ink-muted">{t("subtitle")}</p>
          </Reveal>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-olive" />
                <div>
                  <div className="eyebrow">{t("office")}</div>
                  <div className="mt-1 text-base text-ink">
                    Bodrum, Muğla, Türkiye
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 text-olive" />
                <div>
                  <div className="eyebrow">{t("phone")}</div>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="mt-1 block text-base text-ink link-underline"
                  >
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 text-olive" />
                <div>
                  <div className="eyebrow">{t("email")}</div>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 block text-base text-ink link-underline"
                  >
                    {email}
                  </a>
                </div>
              </div>
              <div className="pt-2">
                <WhatsAppButton />
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-7" delay={0.08}>
            <div className="rounded-xs border border-ivory-300 bg-ivory-50 p-8">
              <h2 className="font-display text-2xl text-ink">
                {t("form.title")}
              </h2>
              <div className="mt-6">
                <InquiryForm compact />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
