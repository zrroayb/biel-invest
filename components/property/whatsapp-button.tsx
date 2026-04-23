"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function WhatsAppButton({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  const t = useTranslations("property");
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const text = message ? encodeURIComponent(message) : "";
  const href = `https://wa.me/${number}${text ? `?text=${text}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`btn btn-outline ${className ?? ""}`}
    >
      <MessageCircle className="h-4 w-4" />
      {t("whatsapp")}
    </a>
  );
}
