"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { LocaleKey } from "@/types/property";

export function InquiryForm({
  propertyId,
  propertySlug,
  defaultMessage,
  compact = false,
}: {
  propertyId?: string;
  propertySlug?: string;
  defaultMessage?: string;
  compact?: boolean;
}) {
  const locale = useLocale() as LocaleKey;
  const t = useTranslations("inquiry");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: defaultMessage ?? "",
    honeypot: "",
  });

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertyId,
          propertySlug,
          locale,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        honeypot: "",
      });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xs border border-olive/30 bg-olive/5 p-6 text-center">
        <div className="font-display text-xl text-ink">{t("success")}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      {!compact && (
        <div>
          <h3 className="font-display text-2xl text-ink">{t("title")}</h3>
          <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
      )}

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={form.honeypot}
        onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t("name")}</label>
          <input
            required
            className="field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t("email")}</label>
          <input
            type="email"
            required
            className="field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label">{t("phone")}</label>
        <input
          className="field"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="label">{t("message")}</label>
        <textarea
          required
          rows={4}
          className="field resize-none"
          placeholder={t("messagePlaceholder")}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-700">{t("error")}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-primary w-full"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>

      <p className="text-[11px] leading-relaxed text-ink-muted">{t("agree")}</p>
    </form>
  );
}
