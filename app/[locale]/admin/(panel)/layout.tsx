import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-env";
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
  // Yerel/demo modu: Firebase yapılandırılmadıysa VE production değilsek panele
  // giriş olmadan izin ver (repo verisini önizlemek için). Canlıda (production)
  // bu bypass devre dışıdır; müşteri verisi asla herkese açık olmaz.
  const localPreview =
    !isFirebaseAdminConfigured() && process.env.NODE_ENV !== "production";
  if (!session && !localPreview) {
    redirect(`/${locale}/admin/login`);
  }
  return (
    <AdminShell locale={locale} email={session?.email ?? "yerel önizleme"}>
      {children}
    </AdminShell>
  );
}
