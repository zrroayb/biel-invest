"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";

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

  const logout = async () => {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  const items = [
    { href: "/admin", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/content", icon: FileText, label: t("siteContent") },
    { href: "/admin/properties", icon: Home, label: t("properties") },
    { href: "/admin/inquiries", icon: MessageSquare, label: t("inquiries") },
  ];

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-ivory-100">
      <aside className="sticky top-0 flex h-screen flex-col border-r border-ivory-300 bg-ivory">
        <div className="border-b border-ivory-300 px-6 py-5">
          <Link
            href="/"
            aria-label="BIEL Invest"
            className="flex items-center gap-3"
          >
            <Logo compact variant="dark" className="h-[32px] w-auto" />
            <span className="text-sm font-semibold tracking-[0.18em] text-ink">
              BIEL{" "}
              <span className="font-normal text-ink-muted">INVEST</span>
            </span>
          </Link>
          <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            Admin
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:bg-ivory-200 hover:text-ink",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-ivory-300 p-4">
          {email && (
            <div className="mb-3 truncate text-xs text-ink-muted">{email}</div>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-xs text-ink-muted hover:bg-ivory-200 hover:text-ink"
          >
            <LogOut className="h-4 w-4" /> {t("logout")}
          </button>
        </div>
      </aside>
      <main className="overflow-y-auto">
        <div className="max-w-[1200px] px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
