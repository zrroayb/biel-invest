import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listInquiries } from "@/lib/firestore/inquiries";
import type { InquiryStatus } from "@/types/inquiry";
import { InquiryActions } from "./_components/inquiry-actions";
import { cn } from "@/lib/utils";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getTranslations("admin.inquiries");
  const sp = await searchParams;
  const activeStatus = (sp.status ?? "all") as InquiryStatus | "all";

  let items: Awaited<ReturnType<typeof listInquiries>> = [];
  try {
    items = await listInquiries(activeStatus);
  } catch {}

  const tabs: { id: InquiryStatus | "all"; label: string }[] = [
    { id: "all", label: t("all") },
    { id: "new", label: t("new") },
    { id: "read", label: t("read") },
    { id: "replied", label: t("replied") },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink sm:text-3xl">{t("title")}</h1>

      <div className="mt-6 sm:mt-8">
        <div className="-mx-1 flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 pl-1 pr-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:rounded-xs sm:border sm:border-ivory-300 sm:bg-ivory-50 sm:p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${tab.id}`}
            className={cn(
              "min-h-11 shrink-0 snap-center rounded-sm px-4 py-2.5 text-center text-xs font-medium uppercase tracking-[0.1em] transition-colors sm:min-w-0 sm:flex-1 sm:rounded-xs sm:py-2",
              activeStatus === tab.id
                ? "bg-ink text-ivory sm:shadow-sm"
                : "border border-ivory-200 bg-ivory-100 text-ink-muted sm:border-0 sm:bg-transparent",
              "active:scale-[0.98]",
            )}
          >
            {tab.label}
          </Link>
        ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {items.length === 0 && (
          <div className="rounded-xs border border-ivory-300 bg-ivory-50 py-16 text-center text-sm text-ink-muted">
            {t("empty")}
          </div>
        )}
        {items.map((i) => (
          <article
            key={i.id}
            className={cn(
              "rounded-lg border bg-ivory-50 p-4 sm:rounded-xs sm:p-5",
              i.status === "new"
                ? "border-olive/40"
                : "border-ivory-300",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium text-ink">{i.name}</div>
                  <span className="chip">{i.status}</span>
                  <span className="chip uppercase">{i.locale}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink-muted">
                  <a href={`mailto:${i.email}`} className="link-underline">
                    {i.email}
                  </a>
                  {i.phone && (
                    <a
                      href={`tel:${i.phone}`}
                      className="link-underline"
                    >
                      {i.phone}
                    </a>
                  )}
                  {i.propertySlug && (
                    <Link
                      href={`/portfoy/${i.propertySlug}`}
                      className="link-underline"
                    >
                      /{i.propertySlug}
                    </Link>
                  )}
                  <span>
                    {new Date(i.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <InquiryActions id={i.id} status={i.status} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {i.message}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
