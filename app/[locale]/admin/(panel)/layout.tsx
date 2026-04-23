import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { AdminShell } from "./_components/admin-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }
  return (
    <AdminShell locale={locale} email={session.email}>
      {children}
    </AdminShell>
  );
}
