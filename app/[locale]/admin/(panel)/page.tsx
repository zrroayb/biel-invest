import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { listProperties } from "@/lib/firestore/properties";
import { listInquiries } from "@/lib/firestore/inquiries";
import { Home, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const t = await getTranslations("admin.dashboard");

  let totalProperties = 0;
  let activeProperties = 0;
  let totalInquiries = 0;
  let newInquiries = 0;

  try {
    const properties = await listProperties({ limit: 1000 });
    totalProperties = properties.length;
    activeProperties = properties.filter(
      (p) => p.status === "satilik" || p.status === "kiralik",
    ).length;
  } catch {}

  try {
    const inquiries = await listInquiries();
    totalInquiries = inquiries.length;
    newInquiries = inquiries.filter((i) => i.status === "new").length;
  } catch {}

  const stats = [
    {
      icon: Home,
      label: t("totalProperties"),
      value: totalProperties,
      href: "/admin/properties",
    },
    {
      icon: Sparkles,
      label: t("activeProperties"),
      value: activeProperties,
      href: "/admin/properties",
    },
    {
      icon: MessageSquare,
      label: t("inquiries"),
      value: totalInquiries,
      href: "/admin/inquiries",
    },
    {
      icon: MessageSquare,
      label: t("newInquiries"),
      value: newInquiries,
      href: "/admin/inquiries?status=new",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-xs border border-ivory-300 bg-ivory-50 p-6 transition-colors hover:border-ink"
          >
            <div className="flex items-center justify-between">
              <s.icon className="h-4 w-4 text-ink-muted" />
              <ArrowRight className="h-4 w-4 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6 font-display text-4xl text-ink">
              {s.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-muted">
              {s.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
