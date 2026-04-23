import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Instagram, Mail, Phone } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  const t = useTranslations("footer");
  const tBrand = useTranslations("brand");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@example.com";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+90 252 000 00 00";

  return (
    <footer className="mt-32 border-t border-ivory-300 bg-ivory">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo variant="dark" className="h-28 w-28" />
            <p className="mt-4 max-w-sm text-sm text-ink-muted">
              {tBrand("tagline")}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a
                href={`mailto:${email}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xs border border-ivory-300 text-ink-muted transition-colors hover:border-ink hover:text-ink"
                aria-label="email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xs border border-ivory-300 text-ink-muted transition-colors hover:border-ink hover:text-ink"
                aria-label="phone"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xs border border-ivory-300 text-ink-muted transition-colors hover:border-ink hover:text-ink"
                aria-label="instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow mb-4">{t("quickLinks")}</div>
            <ul className="space-y-2 text-sm text-ink">
              <li>
                <Link href="/portfoy" className="link-underline">
                  {tNav("portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="link-underline">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/favoriler" className="link-underline">
                  {tNav("favorites")}
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="link-underline">
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="eyebrow mb-4">{t("contact")}</div>
            <ul className="space-y-2 text-sm text-ink">
              <li className="text-ink-muted">{tContact("office")}</li>
              <li>Bodrum, Muğla, Türkiye</li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="link-underline"
                >
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="link-underline"
                >
                  {phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-ivory-300 pt-6 text-xs text-ink-muted md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {tBrand("name")}. {t("rights")}
          </p>
          <p className="uppercase tracking-[0.2em]">Bodrum · Ege</p>
        </div>
      </div>
    </footer>
  );
}
