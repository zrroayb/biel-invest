"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

export function Header() {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const useLightLogo = isHome && !scrolled;

  const navItems = [
    { href: "/portfoy", label: t("portfolio") },
    { href: "/hakkimizda", label: t("about") },
    { href: "/iletisim", label: t("contact") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full transition-all duration-500",
        scrolled
          ? "bg-ivory/85 backdrop-blur-md border-b border-ivory-300"
          : "bg-transparent",
      )}
    >
      <div className="container relative flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center gap-3"
          aria-label="BIEL Invest"
        >
          <Logo
            compact
            variant={useLightLogo ? "light" : "dark"}
            className="h-[32px] w-auto md:h-[36px]"
          />
          <span
            className={cn(
              "hidden flex-col leading-none transition-colors md:flex",
              useLightLogo ? "text-ivory" : "text-ink",
            )}
          >
            <span className="text-sm font-semibold tracking-[0.18em]">
              BIEL{" "}
              <span
                className={cn(
                  "font-normal",
                  useLightLogo ? "text-ivory/75" : "text-ink-muted",
                )}
              >
                INVEST
              </span>
            </span>
            <span
              className={cn(
                "mt-0.5 text-[9px] uppercase tracking-[0.32em]",
                useLightLogo ? "text-ivory/60" : "text-ink-muted",
              )}
            >
              {tBrand("headerMotto")}
            </span>
          </span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center text-sm font-medium leading-none transition-colors",
                useLightLogo
                  ? pathname === item.href
                    ? "text-ivory"
                    : "text-ivory/70 hover:text-ivory"
                  : pathname === item.href
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex shrink-0 items-center gap-4">
          <Link
            href="/favoriler"
            className={cn(
              "hidden md:inline-flex h-9 w-9 items-center justify-center rounded-xs transition-colors",
              useLightLogo
                ? "text-ivory/70 hover:text-ivory"
                : "text-ink-muted hover:text-ink",
            )}
            aria-label={t("favorites")}
          >
            <Heart className="h-4 w-4" />
          </Link>
          <LanguageSwitcher
            className="hidden md:block"
            onDarkBackground={useLightLogo}
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xs md:hidden",
              useLightLogo ? "text-ivory" : "text-ink",
            )}
            aria-label="menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ivory-300 bg-ivory/95 backdrop-blur">
          <div className="container flex flex-col gap-4 py-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-2xl text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/favoriler"
              className="flex items-center gap-2 text-sm text-ink-muted"
            >
              <Heart className="h-4 w-4" /> {t("favorites")}
            </Link>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
