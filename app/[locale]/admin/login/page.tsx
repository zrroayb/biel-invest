"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Logo } from "@/components/layout/logo";

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const params = useSearchParams();
  const locale = useLocale();
  const next = params.get("next") ?? `/${locale}/admin`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed");
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("error");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-dvh min-h-[-webkit-fill-available] w-full items-center justify-center bg-ivory px-4 py-10 [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))] [padding-top:max(1.5rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6"
      data-admin-panel
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <Logo variant="dark" className="h-24 w-24 sm:h-32 sm:w-32" />
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-ink-muted">
            {t("title")}
          </p>
        </div>
        <form onSubmit={handle} className="space-y-5">
          <div>
            <label className="label" htmlFor="admin-login-email">
              {t("email")}
            </label>
            <input
              id="admin-login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              autoFocus
              className="field text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="admin-login-password">
              {t("password")}
            </label>
            <input
              id="admin-login-password"
              type="password"
              autoComplete="current-password"
              required
              className="field text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-base"
          >
            {loading ? "…" : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
