import { listProperties } from "@/lib/firestore/properties";
import { listInquiries } from "@/lib/firestore/inquiries";
import { listSiteAnalyticsEvents } from "@/lib/firestore/site-analytics";
import { aggregateVisitorBehaviorDashboard } from "@/lib/analytics/visitor-behavior-aggregate";
import { BehaviorBiDashboard } from "@/components/admin/behavior/behavior-bi-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let rawEvents: Awaited<ReturnType<typeof listSiteAnalyticsEvents>> = [];
  try {
    rawEvents = await listSiteAnalyticsEvents(5000);
  } catch {
    rawEvents = [];
  }

  const behavior = aggregateVisitorBehaviorDashboard(rawEvents, {
    windowDays: 7,
    recentLimit: 80,
    locale,
  });

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

  return (
    <BehaviorBiDashboard
      behavior={behavior}
      locale={locale}
      ops={{
        totalProperties,
        activeProperties,
        totalInquiries,
        newInquiries,
      }}
    />
  );
}
