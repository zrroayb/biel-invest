import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-env";
import { AdminLoginForm } from "./login-form";

// Firebase kontrolü build anında değil, istek anında yapılsın.
export const dynamic = "force-dynamic";

/**
 * Firebase yapılandırılmamışsa (repo verisiyle çalışan canlı site) giriş zaten
 * mümkün değil; Firebase client'ı yükleyip 500 vermek yerine bilgi ekranı göster.
 * Firebase env'leri girildiğinde mevcut giriş formu otomatik devreye girer.
 */
export default async function AdminLoginPage() {
  if (isFirebaseAdminConfigured()) {
    return (
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    );
  }

  const t = await getTranslations("admin.login");
  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center bg-ivory px-4 py-10"
      data-admin-panel
    >
      <div className="w-full max-w-sm text-center">
        <Logo variant="dark" className="mx-auto h-24 w-24 sm:h-32 sm:w-32" />
        <p className="mt-4 text-xs uppercase tracking-[0.24em] text-ink-muted">
          {t("title")}
        </p>
        <h1 className="mt-6 font-display text-2xl text-ink">
          {t("unavailableTitle")}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">{t("unavailableBody")}</p>
      </div>
    </div>
  );
}
