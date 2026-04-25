"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  FileText,
  LayoutDashboard,
  Home,
  MessageSquare,
  LogOut,
  Tags,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("admin.nav");
  const items = [
    { href: "/admin", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/content", icon: FileText, label: t("siteContent") },
    { href: "/admin/taxonomy", icon: Tags, label: t("taxonomy") },
    { href: "/admin/properties", icon: Home, label: t("properties") },
    { href: "/admin/inquiries", icon: MessageSquare, label: t("inquiries") },
  ];

  return (
    <nav className="flex-1 space-y-1.5 p-3 md:p-3">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors active:scale-[0.99] md:rounded-xs",
              active
                ? "bg-ink text-ivory shadow-sm"
                : "text-ink-muted hover:bg-ivory-200 hover:text-ink",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  locale: string;
  email?: string;
}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  const close = () => setNavOpen(false);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const logout = async () => {
    close();
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-ivory-100">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 max-h-14 min-h-14 items-center justify-between border-b border-ivory-300/90 bg-ivory/95 px-3 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.25rem,env(safe-area-inset-top,0px))] backdrop-blur-md supports-[backdrop-filter]:bg-ivory/90 md:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-sm text-ink transition-colors hover:bg-ivory-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-olive"
          aria-expanded={navOpen}
          aria-controls="admin-nav-drawer"
          aria-label={t("openMenu")}
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
        <Link
          href="/admin"
          onClick={close}
          className="flex min-h-10 items-center justify-center text-sm font-semibold tracking-[0.12em] text-ink"
        >
          BIEL
        </Link>
        <div className="w-11 shrink-0" aria-hidden />
      </header>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-ink/45 backdrop-blur-[2px] md:hidden"
          aria-label={t("closeMenu")}
          onClick={close}
        />
      ) : null}

      <div className="flex min-h-dvh w-full min-w-0">
        <aside
          id="admin-nav-drawer"
          className={cn(
            "fixed left-0 top-0 z-50 flex h-dvh w-[min(18rem,88vw)] max-w-full flex-col border-ivory-300/90 bg-ivory shadow-2xl transition-transform duration-200 ease-out md:sticky md:top-0 md:z-0 md:h-dvh md:w-[260px] md:shrink-0 md:translate-x-0 md:rounded-none md:border-r md:shadow-none",
            navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex items-center justify-between border-b border-ivory-300 px-4 py-4 md:px-6">
            <Link
              href="/"
              aria-label="BIEL Invest"
              onClick={close}
              className="flex min-h-10 min-w-0 items-center gap-2.5"
            >
              <Logo compact variant="dark" className="h-8 w-auto shrink-0" />
              <span className="min-w-0 text-sm font-semibold tracking-[0.12em] text-ink">
                BIEL{" "}
                <span className="font-normal text-ink-muted">INVEST</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink hover:bg-ivory-200 md:hidden"
              aria-label={t("closeMenu")}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="hidden w-11 md:block" aria-hidden />
          </div>
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-ink-muted md:px-6">
            {t("panelBadge")}
          </p>
          <NavContent pathname={pathname} onNavigate={close} />
          <div className="mt-auto space-y-2 border-t border-ivory-300 p-4 md:p-4">
            {email ? (
              <div
                className="truncate rounded-sm bg-ivory-200/50 px-2.5 py-2 text-xs text-ink-muted"
                title={email}
              >
                {email}
              </div>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-sm px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-ivory-200 hover:text-ink"
            >
              <LogOut className="h-5 w-5 shrink-0" /> {t("logout")}
            </button>
          </div>
        </aside>

        <main
          data-admin-panel
          className="min-w-0 flex-1 pt-14 [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))] md:pt-0"
        >
          <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-4 sm:px-5 sm:pt-6 md:px-8 md:pb-10 md:pt-10 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
