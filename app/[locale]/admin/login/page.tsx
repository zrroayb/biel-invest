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
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo variant="dark" className="h-32 w-32" />
          <div className="mt-4 text-xs uppercase tracking-[0.24em] text-ink-muted">
            {t("title")}
          </div>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="label">{t("email")}</label>
            <input
              type="email"
              required
              autoFocus
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t("password")}</label>
            <input
              type="password"
              required
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-xs text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "..." : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
