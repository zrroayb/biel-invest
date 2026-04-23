"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname, routing } from "@/i18n/routing";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher({
  className,
  onDarkBackground,
}: {
  className?: string;
  /** Light text for transparent header over dark hero (e.g. home top) */
  onDarkBackground?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const change = (next: string) => {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next as (typeof routing.locales)[number] });
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] transition-colors",
          onDarkBackground
            ? "text-ivory/75 hover:text-ivory"
            : "text-ink-muted hover:text-ink",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
      >
        {locale}
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-xs border border-ivory-300 bg-ivory-50 shadow-soft"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => change(l)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-ivory-200",
                  l === locale
                    ? "text-ink font-medium"
                    : "text-ink-muted",
                )}
              >
                {t(l)}
                <span className="text-[10px] uppercase opacity-60">{l}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
